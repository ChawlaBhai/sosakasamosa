'use client';
import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import dagre from 'dagre';
import { FamilyMember, getFamilyMembers } from '@/actions/family';
import FamilyNode from '@/components/FamilyTree/FamilyNode';
import styles from './FamilyBoard.module.css';
import { Loader2, Plus, Wrench } from 'lucide-react';
import AddMemberForm from './AddMemberForm';
import MemberEditModal from './MemberEditModal';
import AnniversaryModal from './AnniversaryModal';
import { updateFamilyMember } from '@/actions/family';

interface NodePosition {
    id: string;
    x: number;
    y: number;
    data: FamilyMember;
    scale: number;
}

interface Edge {
    points: { x: number; y: number }[];
    type?: 'child' | 'partner';
    member1Id?: string;
    member2Id?: string;
}

const nodeWidth = 180;
const nodeHeight = 220;

// Helper to draw Curvy Elbow paths for cleaner bundling
const getStepPath = (start: { x: number; y: number }, end: { x: number; y: number }, midPercent = 0.5) => {
    const midX = start.x + (end.x - start.x) * midPercent;
    const midY = start.y + (end.y - start.y) * midPercent;

    // Predominantly horizontal (sides)
    if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
        return `M ${start.x},${start.y} L ${midX},${start.y} C ${midX + (end.x - midX) / 2},${start.y} ${midX + (end.x - midX) / 2},${end.y} ${end.x},${end.y}`;
    }
    // Predominantly vertical (descendants)
    return `M ${start.x},${start.y} L ${start.x},${midY} C ${start.x},${midY + (end.y - midY) / 2} ${end.x},${midY + (end.y - midY) / 2} ${end.x},${end.y}`;
};

export default function FamilyBoard() {
    const [nodes, setNodes] = useState<NodePosition[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [initialValues, setInitialValues] = useState<{ type: 'partner' | 'child' | 'parent', relativeId: string } | null>(null);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [isEditingAnniversary, setIsEditingAnniversary] = useState<{ p1: FamilyMember, p2: FamilyMember } | null>(null);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const transformRef = React.useRef<any>(null);

    // Helpers for Bi-directional Roots
    const getAncestors = (memberId: string, members: FamilyMember[], visited = new Set<string>()) => {
        if (visited.has(memberId)) return [];
        visited.add(memberId);
        const member = members.find(m => m.id === memberId);
        if (!member || !member.parent_ids) return [];
        let ancestors = [...member.parent_ids];
        member.parent_ids.forEach(pid => {
            ancestors = [...ancestors, ...getAncestors(pid, members, visited)];
        });
        return ancestors;
    };

    const getDescendants = (memberId: string, members: FamilyMember[], visited = new Set<string>()) => {
        if (visited.has(memberId)) return [];
        visited.add(memberId);
        const children = members.filter(m => m.parent_ids?.includes(memberId));
        let descendants = children.map(c => c.id);
        children.forEach(c => {
            descendants = [...descendants, ...getDescendants(c.id, members, visited)];
        });
        return descendants;
    };

    const calculateDepth = (memberId: string, rootIds: string[], members: FamilyMember[], direction: 'ancestors' | 'descendants' | 'side'): number => {
        if (rootIds.includes(memberId)) return 0;
        const member = members.find(m => m.id === memberId);
        if (!member) return 0;

        if (direction === 'ancestors' || direction === 'side') {
            const children = members.filter(m => m.parent_ids?.includes(memberId));
            const partners = members.filter(m => m.partner_id === memberId);

            if (children.length === 0 && partners.length === 0) return 1;
            return 1; // Default depth step for scaling
        } else {
            if (!member.parent_ids || member.parent_ids.length === 0) return 0;
            const maxParentDepth = Math.max(...member.parent_ids.map(pid => calculateDepth(pid, rootIds, members, direction)));
            return maxParentDepth + 1;
        }
    };

    const getSideMembers = (startId: string, stopIds: Set<string>, members: FamilyMember[]) => {
        const side = new Set<string>();
        const queue = [startId];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;

            // Critical fix: Allow startId even if it's in stopIds (so we can start the search!)
            if (currentId !== startId && stopIds.has(currentId)) {
                continue;
            }

            visited.add(currentId);

            const m = members.find(member => member.id === currentId);
            if (!m) continue;

            if (currentId !== startId) side.add(currentId);

            if (m.parent_ids) queue.push(...m.parent_ids);
            if (m.partner_id) queue.push(m.partner_id);
            const children = members.filter(member => member.parent_ids?.includes(currentId));
            children.forEach(c => {
                // EXTREMELY IMPORTANT: Don't follow Sahaj/Somya's children into side branches!
                if (!stopIds.has(c.id)) {
                    queue.push(c.id);
                }
            });
        }
        return side;
    };

    const calculateManhattanDepth = (id: string, startId: string, members: FamilyMember[]) => {
        const queue: [string, number][] = [[startId, 0]];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const [curr, dist] = queue.shift()!;
            if (curr === id) return dist;
            if (visited.has(curr)) continue;
            visited.add(curr);
            const m = members.find(member => member.id === curr);
            if (!m) continue;
            const neighbors = [
                ...(m.parent_ids || []),
                ...(m.partner_id ? [m.partner_id] : []),
                ...members.filter(nm => nm.parent_ids?.includes(curr)).map(nm => nm.id)
            ];
            neighbors.forEach(n => queue.push([n, dist + 1]));
        }
        return 2;
    };

    useEffect(() => {
        loadFamily();
    }, []);

    const loadFamily = async () => {
        setLoading(true);
        try {
            const members = await getFamilyMembers();
            setFamilyMembers(members);
            layoutGraph(members);
        } catch (err) {
            console.error("[Load] Failed to load family:", err);
            alert("Failed to load family tree data.");
        } finally {
            setLoading(false);
        }
    };

    const layoutGraph = (members: FamilyMember[]) => {
        const sahaj = members.find(m => m.name.toLowerCase().includes('sahaj'));
        const somya = members.find(m => m.name.toLowerCase().includes('somya'));

        if (!sahaj || !somya) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const canvasCenter = 2000;
        const mainCoupleGap = 200;
        const partnerGap = 110;

        const bridgeIds = new Set([sahaj.id, somya.id]);
        const sharedChildren = members.filter(m =>
            m.parent_ids?.includes(sahaj.id) && m.parent_ids?.includes(somya.id)
        );
        sharedChildren.forEach(sc => bridgeIds.add(sc.id));

        // 1. Gather descendants first to use them as a blacklist
        const descendantsIds = new Set<string>();
        const collectProgeny = (pid: string) => {
            members.filter(m => m.parent_ids?.includes(pid)).forEach(c => {
                if (!descendantsIds.has(c.id)) {
                    descendantsIds.add(c.id);
                    collectProgeny(c.id);
                }
            });
        };
        sharedChildren.forEach(sc => {
            descendantsIds.add(sc.id);
            collectProgeny(sc.id);
        });

        const blacklist = new Set([...bridgeIds, ...descendantsIds]);



        const sahajSideIds = getSideMembers(sahaj.id, blacklist, members);
        const somyaSideIds = getSideMembers(somya.id, blacklist, members);

        const newNodes: NodePosition[] = [];
        const newEdges: Edge[] = [];

        // 1. Position Main Couple: Somya (Left) - Sahaj (Right)
        const somyaPos: NodePosition = {
            id: somya.id,
            x: canvasCenter - (nodeWidth * 1.2) - (mainCoupleGap / 2),
            y: canvasCenter - (nodeHeight * 1.2) / 2,
            data: somya,
            scale: 1.2
        };
        const sahajPos: NodePosition = {
            id: sahaj.id,
            x: canvasCenter + (mainCoupleGap / 2),
            y: canvasCenter - (nodeHeight * 1.2) / 2,
            data: sahaj,
            scale: 1.2
        };
        newNodes.push(somyaPos, sahajPos);

        newEdges.push({
            points: [
                { x: somyaPos.x + (nodeWidth * 1.2), y: somyaPos.y + (nodeHeight * 1.2) / 2 },
                { x: sahajPos.x, y: sahajPos.y + (nodeHeight * 1.2) / 2 }
            ],
            type: 'partner',
            member1Id: somya.id,
            member2Id: sahaj.id
        });

        // 2. Helper to layout a sub-tree (Unchanged logic, just calling with different params below)
        const layoutSubTree = (
            ids: Set<string>,
            rankdir: string,
            direction: 'ancestors' | 'descendants' | 'side',
            roots: string[],
            anchorX: number,
            anchorY: number
        ) => {
            if (ids.size === 0) return;

            const g = new dagre.graphlib.Graph();
            const ranksep = direction === 'descendants' ? 80 : 300; // Reduce gap for children
            g.setGraph({ rankdir, nodesep: 200, ranksep });
            g.setDefaultEdgeLabel(() => ({}));

            console.log(`[LayoutSubTree] ${direction} (${rankdir}) - Roots: ${roots.join(', ')} - Anchor: ${anchorX}, ${anchorY}`);

            roots.forEach(rid => {
                g.setNode(String(rid), { width: nodeWidth * 1.2, height: nodeHeight * 1.2, type: 'root' });
            });

            const subMembers = members.filter(m => ids.has(m.id));
            const processed = new Set<string>();
            const partnerPairs: [string, string][] = [];

            subMembers.forEach(m => {
                if (m.partner_id && !processed.has(m.id) && ids.has(m.partner_id)) {
                    partnerPairs.push([m.id, m.partner_id]);
                    processed.add(m.id);
                    processed.add(m.partner_id);
                }
            });

            subMembers.forEach(m => {
                if (processed.has(m.id)) return;
                const d = direction === 'side' ? calculateManhattanDepth(m.id, roots[0], members) : calculateDepth(m.id, roots, members, direction);
                const scale = Math.pow(0.85, d);
                g.setNode(m.id, { width: nodeWidth * scale, height: nodeHeight * scale, type: 'single', data: m, scale });
            });

            partnerPairs.forEach(([p1Id, p2Id]) => {
                const d = direction === 'side' ? calculateManhattanDepth(p1Id, roots[0], members) : calculateDepth(p1Id, roots, members, direction);
                const scale = Math.pow(0.85, d);
                // Partners stacked vertically for sides
                const w = (rankdir === 'LR' || rankdir === 'RL') ? nodeWidth * scale : (nodeWidth * 2 * scale) + (partnerGap * scale);
                const h = (rankdir === 'LR' || rankdir === 'RL') ? (nodeHeight * 2 * scale) + (partnerGap * scale) : nodeHeight * scale;
                g.setNode(`couple-${p1Id}-${p2Id}`, { width: w, height: h, type: 'couple', p1Id, p2Id, scale });
            });

            const getNodeId = (mid: string) => {
                const pair = partnerPairs.find(p => p[0] === mid || p[1] === mid);
                return pair ? `couple-${pair[0]}-${pair[1]}` : mid;
            };

            members.forEach((m, mIdx) => {
                if (m.parent_ids) {
                    m.parent_ids.forEach(pid => {
                        const fromIsRelevant = ids.has(pid) || roots.includes(pid);
                        const toIsRelevant = ids.has(m.id) || roots.includes(m.id);
                        if (fromIsRelevant && toIsRelevant) {
                            const fromId = String(getNodeId(pid));
                            const toId = String(getNodeId(m.id));
                            if (fromId && toId && fromId !== toId) {
                                // Add a high weight to force parents and children to align tightly, reducing criss-cross.
                                // Further, assign ascending minlen to preserve array-order sequence.
                                g.setEdge(fromId, toId, { weight: 100 - mIdx, minlen: 1 });
                            }
                        }
                    });
                }
            });

            // Special Case: Ensure orphan descendants (like overridden Sheero) are connected to Root
            if (direction === 'descendants') {
                subMembers.forEach(m => {
                    if (!g.neighbors(m.id) || g.neighbors(m.id)!.length === 0) {
                        // Connect to first root (Sahaj) to ensure layout
                        if (roots.length > 0) {
                            g.setEdge(String(roots[0]), m.id);
                        }
                    }
                });
            }

            dagre.layout(g);

            const firstRootId = String(roots[0]);
            const firstRoot = g.node(firstRootId);
            if (!firstRoot) {
                console.warn(`[Layout] Root ${firstRootId} not found in dagre graph for direction ${direction}`);
            } else {
                console.log(`[Layout] Root ${firstRootId} found at ${firstRoot.x}, ${firstRoot.y}`);
            }

            let tx = anchorX;
            let ty = anchorY;

            if (roots.length > 0) {
                // If descendants, center the whole root sub-graph (Sahaj+Somya) on anchorX
                if (direction === 'descendants' && roots.length === 2) {
                    const r1 = g.node(String(roots[0]));
                    const r2 = g.node(String(roots[1]));
                    if (r1 && r2) {
                        const dagreCenterX = (r1.x + r2.x) / 2;
                        tx = anchorX - dagreCenterX; // anchorX is canvasCenter, so center of roots matches canvasCenter
                        ty = anchorY - (Math.max(r1.y, r2.y) - r1.height / 2); // Map Top-Left to anchorY precisely without arbitrary pull
                    }
                } else if (firstRoot) {
                    tx = anchorX - (firstRoot.x - firstRoot.width / 2); // Map Root Top-Left to anchorX
                    ty = anchorY - (firstRoot.y - firstRoot.height / 2); // Map Root Top-Left to anchorY
                }
            }

            console.log(`[Layout] Translation for ${direction}: tx=${tx}, ty=${ty}`);

            g.nodes().forEach(v => {
                const ln = g.node(v) as any;
                if (ln.type === 'root') return;

                if (ln.type === 'couple') {
                    const p1 = members.find(m => m.id === ln.p1Id)!;
                    const p2 = members.find(m => m.id === ln.p2Id)!;
                    const s = ln.scale;

                    // Center vertically relative to children in sub-tree (Dagre centers)
                    if (direction === 'side' || direction === 'ancestors') {
                        const childrenOfThisCouple = members.filter(m => m.parent_ids?.includes(p1.id) && m.parent_ids?.includes(p2.id));
                        const relevantChildren = childrenOfThisCouple.filter(c => ids.has(c.id) || roots.includes(c.id));
                        if (relevantChildren.length > 0) {
                            const cNodesPositions = relevantChildren.map(rc => {
                                const gn = g.node(rc.id);
                                return gn ? gn.y : null;
                            }).filter(y => y !== null) as number[];
                            if (cNodesPositions.length > 0) {
                                const minY = Math.min(...cNodesPositions);
                                const maxY = Math.max(...cNodesPositions);
                                const midY = (minY + maxY) / 2;
                                ln.y = midY;
                            }
                        }
                    }

                    // ln.x, ln.y are Dagre CENTERS. Translate to physical canvas CENTERS.
                    const centerSX = ln.x + tx;
                    const centerSY = ln.y + ty;

                    // Convert to Top-Left for DOM positioning based on the full couple box size `ln.width`, `ln.height`.
                    const topLeftX = centerSX - ln.width / 2;
                    const topLeftY = centerSY - ln.height / 2;

                    let curSX = topLeftX;
                    let curSY = topLeftY;

                    if (rankdir === 'LR' || rankdir === 'RL') {
                        newNodes.push({ id: ln.p1Id, x: curSX, y: curSY, data: p1, scale: s });
                        newNodes.push({ id: ln.p2Id, x: curSX, y: curSY + (nodeHeight * s) + (partnerGap * s), data: p2, scale: s });
                    } else {
                        newNodes.push({ id: ln.p1Id, x: curSX, y: curSY, data: p1, scale: s });
                        newNodes.push({ id: ln.p2Id, x: curSX + (nodeWidth * s) + (partnerGap * s), y: curSY, data: p2, scale: s });
                    }

                    newEdges.push({
                        points: [
                            { x: curSX + (nodeWidth * s) / 2, y: curSY + (nodeHeight * s) / 2 },
                            {
                                x: curSX + (nodeWidth * s) / 2 + (rankdir === 'TB' ? (nodeWidth * s) + (partnerGap * s) : 0),
                                y: curSY + (nodeHeight * s) / 2 + (rankdir !== 'TB' ? (nodeHeight * s) + (partnerGap * s) : 0)
                            }
                        ],
                        type: 'partner',
                        member1Id: ln.p1Id,
                        member2Id: ln.p2Id
                    });
                } else if (ln.type === 'single') {
                    const centerSX = ln.x + tx;
                    const centerSY = ln.y + ty;
                    const topLeftX = centerSX - ln.width / 2;
                    const topLeftY = centerSY - ln.height / 2;
                    newNodes.push({ id: v, x: topLeftX, y: topLeftY, data: ln.data, scale: ln.scale });
                }
            });
        };

        // Somya (Girl) -> Left Canvas (Ancestors flow Left) => RankDir LR (Empirically validated)
        layoutSubTree(somyaSideIds, 'LR', 'side', [somya.id], somyaPos.x, somyaPos.y);

        // Sahaj (Boy) -> Right Canvas (Ancestors flow Right) => RankDir RL (Empirically validated)
        layoutSubTree(sahajSideIds, 'RL', 'side', [sahaj.id], sahajPos.x + nodeWidth * 1.2, sahajPos.y);

        // Children -> Down
        // We want the center of the descendants tree to align with the canvas center (the gap between Somya and Sahaj)
        const downAnchorX = canvasCenter;
        const downAnchorY = sahajPos.y; // Keep Y tight to bottom of parents
        layoutSubTree(descendantsIds, 'TB', 'descendants', [sahaj.id, somya.id], downAnchorX, downAnchorY);

        // 3. Global Edges & Junction Bundling (Curvy Version)
        const parentGroups = new Map<string, string[]>();
        members.forEach(m => {
            if (m.parent_ids && m.parent_ids.length > 0) {
                const key = [...m.parent_ids].sort().join(',');
                if (!parentGroups.has(key)) parentGroups.set(key, []);
                parentGroups.get(key)!.push(m.id);
            }
        });

        parentGroups.forEach((childIds, parentKey) => {
            const parentIds = parentKey.split(',');
            let pNodes = parentIds.map(pid => newNodes.find(n => String(n.id) === String(pid))).filter(Boolean) as NodePosition[];

            // Universal Fix: If only one parent is recorded in the group, look for their rendered partner
            // to ensure the edge originates from the couple's heartline.
            if (pNodes.length === 1) {
                const singleId = pNodes[0].id;

                // Look up the exact visual rendering topology to find the true drawn partner
                const partnerEdge = newEdges.find(e => e.type === 'partner' && (e.member1Id === singleId || e.member2Id === singleId));

                if (partnerEdge && partnerEdge.member1Id && partnerEdge.member2Id) {
                    const actualPartnerId = partnerEdge.member1Id === singleId ? partnerEdge.member2Id : partnerEdge.member1Id;
                    const partnerNode = newNodes.find(n => n.id === actualPartnerId);

                    if (partnerNode && !pNodes.find(p => p.id === partnerNode.id)) {
                        pNodes.push(partnerNode);
                    }
                }
            }

            const cNodes = childIds.map(cid => newNodes.find(n => n.id === cid)).filter(Boolean) as NodePosition[];

            if (pNodes.length === 0 || cNodes.length === 0) return;

            // Start from EXACT center of all resolved parents for this group
            let avgPX = 0;
            let avgPY = 0;

            if (pNodes.length === 2) {
                // For couples, ensure we get the exact midway point between their centers
                const x1 = pNodes[0].x + (nodeWidth * pNodes[0].scale) / 2;
                const y1 = pNodes[0].y + (nodeHeight * pNodes[0].scale) / 2;
                const x2 = pNodes[1].x + (nodeWidth * pNodes[1].scale) / 2;
                const y2 = pNodes[1].y + (nodeHeight * pNodes[1].scale) / 2;

                avgPX = (x1 + x2) / 2;
                avgPY = (y1 + y2) / 2;
            } else {
                avgPX = pNodes.reduce((acc, p) => acc + (p.x + (nodeWidth * p.scale) / 2), 0) / pNodes.length;
                avgPY = pNodes.reduce((acc, p) => acc + (p.y + (nodeHeight * p.scale) / 2), 0) / pNodes.length;
            }

            // Sort cNodes physically to apply staggered bezier nesting and avoid mid-spline crossing
            const isVerticalFlowParents = pNodes.length === 2 && Math.abs(pNodes[0].x - pNodes[1].x) > Math.abs(pNodes[0].y - pNodes[1].y);
            const sortedCNodes = [...cNodes].sort((a, b) => isVerticalFlowParents ? a.x - b.x : a.y - b.y);

            sortedCNodes.forEach((cn, i) => {
                const cx = cn.x + (nodeWidth * cn.scale) / 2;
                const cy = cn.y + (nodeHeight * cn.scale) / 2;

                const dx = cx - avgPX;
                const dy = cy - avgPY;
                let cp1, cp2;

                // Bind edge vector tangent to the exact orthographic alignment of the parent tree layout
                let isVerticalFlow = Math.abs(dy) > Math.abs(dx);
                if (pNodes.length === 2) {
                    const parentDx = Math.abs(pNodes[0].x - pNodes[1].x);
                    const parentDy = Math.abs(pNodes[0].y - pNodes[1].y);
                    isVerticalFlow = parentDx > parentDy;
                }

                // Stagger factor ensures inner lines arc tightly, outer lines arc widely (no criss-cross)
                // Normalize it around the center so half go tight, half go wide to make a clean fan shape.
                // We use a progressive spread from 0.2 to 0.8
                const spreadTension = cNodes.length > 1 ? 0.3 + (0.4 * (i / (cNodes.length - 1))) : 0.5;

                if (isVerticalFlow) {
                    // Vertical flow focus (S-Curve)
                    cp1 = { x: avgPX, y: avgPY + dy * spreadTension };
                    cp2 = { x: cx, y: cy - dy * (1 - spreadTension) };
                } else {
                    // Horizontal flow focus
                    cp1 = { x: avgPX + dx * spreadTension, y: avgPY };
                    cp2 = { x: cx - dx * (1 - spreadTension), y: cy };
                }

                newEdges.push({
                    points: [
                        { x: avgPX, y: avgPY },
                        cp1,
                        cp2,
                        { x: cx, y: cy }
                    ],
                    type: 'child',
                    member1Id: pNodes[0].id, // Just for keying
                    member2Id: cn.id
                });
            });
        });



        // Remove edges from Gopal to Sheero?
        // It's hard to identify which edge is which without IDs.
        // But likely user won't mind an extra line or we can filter edges targeting Sheero.

        // Important: Filter out any undefined nodes that may have seeped through
        setNodes(newNodes.filter(n => n && n.data));
        setEdges(newEdges);
        console.table(newNodes.map(n => ({ id: n.id.substring(0, 8), x: Math.round(n.x), y: Math.round(n.y) })));

        // Center on Sahaj & Somya as the reference frame
        setTimeout(() => {
            if (transformRef.current) {
                const { setTransform } = transformRef.current;
                const viewerWidth = window.innerWidth;
                const viewerHeight = window.innerHeight;
                const midX = (sahajPos.x + somyaPos.x + nodeWidth * 1.2) / 2;
                const midY = (sahajPos.y + somyaPos.y + nodeHeight * 1.2) / 2;

                // Calculate transform to put (midX, midY) at (viewerWidth/2, viewerHeight/2)
                const scale = 0.8;
                const tx = (viewerWidth / 2) - midX * scale;
                const ty = (viewerHeight / 2) - midY * scale;

                setTransform(tx, ty, scale);
            }
        }, 500);
    };

    const handleAddRelative = (relativeId: string) => {
        setInitialValues({ type: 'partner', relativeId });
        setIsAdding(true);
    };

    const handleFixRelationships = async () => {
        setLoading(true);
        try {
            const members = await getFamilyMembers();
            for (const m of members) {
                const update: any = {};
                if (m.partner_id && !members.find(p => p.id === m.partner_id)) update.partner_id = null;
                if (m.parent_ids) {
                    const validParents = m.parent_ids.filter(pid => members.find(p => p.id === pid));
                    if (validParents.length !== m.parent_ids.length) update.parent_ids = validParents;
                }
                if (Object.keys(update).length > 0) await updateFamilyMember(m.id, update);
            }
            await loadFamily();
            alert("Relationships fixed!");
        } catch (e) {
            console.error(e);
            alert("Error fixing relationships.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className={styles.container}>
            <TransformWrapper
                ref={transformRef}
                initialScale={0.6}
                minScale={0.1}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={false}
            >
                <TransformComponent wrapperClass={styles.canvasWrapper} contentClass={styles.canvasContent}>
                    <div className={styles.graphContainer} style={{ width: '4000px', height: '4000px', position: 'relative' }}>
                        <svg className={styles.svgOverlay}>
                            {/* First Pass: Connection Lines */}
                            {edges.map((edge, i) => {
                                let path = '';
                                if (edge.type === 'partner') {
                                    let start = edge.points[0];
                                    let end = edge.points[1];
                                    if (start.y > end.y || (start.y === end.y && start.x > end.x)) {
                                        [start, end] = [end, start];
                                    }
                                    path = `M ${start.x},${start.y} L ${end.x},${end.y}`;
                                    return (
                                        <React.Fragment key={`edge-${i}`}>
                                            <path d={path} stroke="transparent" strokeWidth="30" fill="none" />
                                            <path d={path} stroke="rgba(255, 20, 147, 0.2)" strokeWidth="15" fill="none" />
                                        </React.Fragment>
                                    );
                                } else {
                                    if (edge.points.length === 4) {
                                        const [p0, p1, p2, p3] = edge.points;
                                        path = `M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
                                    } else {
                                        path = getStepPath(edge.points[0], edge.points[1]);
                                    }
                                    return <path key={`edge-${i}`} d={path} stroke="#aaa" fill="none" strokeWidth={2} />;
                                }
                            })}

                            {/* Second Pass: Text Overlays (Hearts & Dates) */}
                            {edges.map((edge, i) => {
                                if (edge.type !== 'partner') return null;

                                let start = edge.points[0];
                                let end = edge.points[1];
                                if (start.y > end.y || (start.y === end.y && start.x > end.x)) {
                                    [start, end] = [end, start];
                                }

                                const isVertical = Math.abs(end.y - start.y) > Math.abs(end.x - start.x);
                                const pathId = `partner-path-${i}`;
                                const path = `M ${start.x},${start.y} L ${end.x},${end.y}`; // Needed for textPath reference if horizontal

                                const m1 = familyMembers.find(m => m.id === edge.member1Id);
                                const m2 = familyMembers.find(m => m.id === edge.member2Id);
                                const anniversaryDate = m1?.anniversary_date || m2?.anniversary_date;

                                return (
                                    <g key={`decor-${i}`} style={{ cursor: 'pointer', pointerEvents: 'auto' }} onClick={() => { if (m1 && m2) setIsEditingAnniversary({ p1: m1, p2: m2 }); }}>
                                        {/* Invisible path for textPath referencing if needed */}
                                        {!isVertical && <path id={pathId} d={path} stroke="none" fill="none" />}

                                        {isVertical ? (
                                            // Vertical: Upright hearts stack
                                            (() => {
                                                const dist = Math.abs(end.y - start.y);
                                                const count = Math.max(1, Math.floor(dist / 20));
                                                const heartsArray = Array.from({ length: count }, (_, idx) => ({
                                                    x: start.x,
                                                    y: start.y + (idx + 1) * (dist / (count + 1))
                                                }));
                                                return heartsArray.map((h, hIdx) => (
                                                    <text key={`ht-${hIdx}`} x={h.x} y={h.y} fill="#ff1493" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">♥</text>
                                                ));
                                            })()
                                        ) : (
                                            // Horizontal: Hearts evenly spaced
                                            (() => {
                                                const dist = Math.abs(end.x - start.x);
                                                const count = Math.max(1, Math.floor(dist / 20));
                                                const heartsArray = Array.from({ length: count }, (_, idx) => ({
                                                    x: start.x + (idx + 1) * (dist / (count + 1)),
                                                    y: start.y
                                                }));
                                                return heartsArray.map((h, hIdx) => (
                                                    <text key={`ht-${hIdx}`} x={h.x} y={h.y} fill="#ff1493" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">♥</text>
                                                ));
                                            })()
                                        )}

                                        {anniversaryDate && (
                                            <g>
                                                <rect
                                                    x={(start.x + end.x) / 2 - 50}
                                                    y={(start.y + end.y) / 2 - 12 + (isVertical ? 8 : 0)}
                                                    width="100"
                                                    height="24"
                                                    fill="white"
                                                    opacity="0.85"
                                                    rx="6"
                                                />
                                                <text
                                                    x={(start.x + end.x) / 2}
                                                    y={(start.y + end.y) / 2 + (isVertical ? 8 : 0)}
                                                    fill="#ff1493"
                                                    fontSize="11"
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    {anniversaryDate}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {nodes.map((node) => (
                            <div key={node.id} id={node.id} style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: nodeWidth * node.scale,
                                height: nodeHeight * node.scale,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10,
                            }}>
                                <FamilyNode
                                    member={node.data}
                                    isHighlighted={node.data?.name?.includes('Sahaj') || node.data?.name?.includes('Somya')}
                                    onAddRelative={handleAddRelative}
                                    onClick={(m) => setEditingMember(m)}
                                    scale={node.scale}
                                />
                            </div>
                        ))}
                    </div>
                </TransformComponent>
            </TransformWrapper>

            {isAdding && <AddMemberForm existingMembers={nodes.map(n => n.data)} onMemberAdded={loadFamily} onClose={() => setIsAdding(false)} initialValues={initialValues} />}
            {editingMember && <MemberEditModal member={editingMember} onClose={() => setEditingMember(null)} onUpdate={loadFamily} />}
            {isEditingAnniversary && <AnniversaryModal p1={isEditingAnniversary.p1} p2={isEditingAnniversary.p2} onClose={() => setIsEditingAnniversary(null)} onUpdate={loadFamily} />}

            <div className={styles.fabContainer}>
                <button className={styles.fixBtn} onClick={handleFixRelationships} title="Fix Relationships"><Wrench size={24} /></button>
                <button className={styles.fab} onClick={() => { setInitialValues(null); setIsAdding(true); }}><Plus size={32} /></button>
            </div>
        </div>
    );
}
