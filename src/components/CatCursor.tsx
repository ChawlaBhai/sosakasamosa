"use client";
import { useEffect, useRef, useState } from 'react';

export default function CatCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const tuftRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const svg = svgRef.current;
        const path = pathRef.current;
        const tuft = tuftRef.current;
        if (!cursor || !svg || !path || !tuft) return;

        // Position state
        let mouseX = 0;
        let mouseY = 0;

        let catX = 0;
        let catY = 0;

        let tailTipX = 0;
        let tailTipY = 0;

        let velocityX = 0;
        let velocityY = 0;
        let tailVelocityY = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animate = () => {
            // 1. Cat Head Physics
            const targetCatX = mouseX + 12;
            const targetCatY = mouseY + 12;

            const dx = targetCatX - catX;
            const dy = targetCatY - catY;

            catX += dx * 0.25;
            catY += dy * 0.25;

            velocityX = (targetCatX - catX) * 0.5;
            velocityY = (targetCatY - catY) * 0.5;

            if (cursor) {
                cursor.style.transform = `translate(${catX}px, ${catY}px)`;
            }

            // 2. Tail Physics with Gravity
            const tailTargetX = catX - velocityX * 2.0;
            const tailTargetY = catY - velocityY * 2.0;

            // Gravity accumulates
            tailVelocityY += 0.8;

            // Allow tail to hang straight down when stopped
            // We shift the target X to be the anchor X when velocity is low
            const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

            let effectiveTargetX = tailTargetX;
            if (speed < 1.0) {
                // When stopped, target is directly below anchor
                effectiveTargetX = catX + 16;
            }

            // Move tip
            tailTipX += (effectiveTargetX - tailTipX) * 0.15;
            tailTipY += (tailTargetY - tailTipY) * 0.15 + tailVelocityY * 0.1;

            // Decay gravity velocity
            tailVelocityY *= 0.9;

            // Constrain length
            const anchorX = catX + 16;
            const anchorY = catY + 16;
            const dist = Math.sqrt((tailTipX - anchorX) ** 2 + (tailTipY - anchorY) ** 2);
            const maxLen = 70;

            if (dist > maxLen) {
                const angle = Math.atan2(tailTipY - anchorY, tailTipX - anchorX);
                tailTipX = anchorX + Math.cos(angle) * maxLen;
                tailTipY = anchorY + Math.sin(angle) * maxLen;
                tailVelocityY *= 0.1;
            }

            // 3. Draw Tail
            // Midpoint
            const midX = (anchorX + tailTipX) / 2;
            const midY = (anchorY + tailTipY) / 2;

            const sag = Math.abs(tailTipX - anchorX) * 0.2;
            const cy = midY + sag;
            const cx = midX;

            if (path) {
                const d = `M ${anchorX} ${anchorY} Q ${cx} ${cy} ${tailTipX} ${tailTipY}`;
                path.setAttribute('d', d);
            }

            // 4. Draw Tuft
            if (tuft) {
                const tuftR = 5;
                // Simple fluffy circle stroke
                const dCircle = `M ${tailTipX + tuftR} ${tailTipY} A ${tuftR} ${tuftR} 0 1 0 ${tailTipX - tuftR} ${tailTipY} A ${tuftR} ${tuftR} 0 1 0 ${tailTipX + tuftR} ${tailTipY}`;
                tuft.setAttribute('d', dCircle);
            }

            requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', onMouseMove);
        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <svg
                ref={svgRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    overflow: 'visible'
                }}
            >
                {/* Tail */}
                <path
                    ref={pathRef}
                    d=""
                    fill="none"
                    stroke="#FFBF00"
                    strokeWidth="8"
                    strokeLinecap="round"
                    style={{
                        filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.1))',
                    }}
                />
                {/* Tail Tuft */}
                <path
                    ref={tuftRef}
                    d=""
                    fill="#FFBF00"
                    stroke="none"
                    style={{
                        filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.1))',
                    }}
                />
            </svg>

            <div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '32px',
                    height: '32px',
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            >
                🐱
            </div>

            <style jsx global>{`
                body {
                    cursor: auto !important; 
                }
                a, button, [role="button"] {
                    cursor: pointer !important;
                }
            `}</style>
        </>
    );
}
