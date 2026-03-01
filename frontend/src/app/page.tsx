'use client';
import React from 'react';
import Topbar from '../components/Topbar';
import LeftSidebar from '../components/LeftSidebar';
import FeedColumn from '../components/FeedColumn';
import RightSidebar from '../components/RightSidebar';

export default function HomePage() {
    return (
        <div style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Topbar />

            {/* 3-column layout below topbar */}
            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    padding: '72px 20px 0',
                    maxWidth: 1400,
                    margin: '0 auto',
                    alignItems: 'flex-start',
                    flex: 1,
                    width: '100%',
                    minHeight: 0, // allows flex children to scroll properly
                }}
            >
                <LeftSidebar />
                <FeedColumn />
                <RightSidebar />
            </div>
        </div>
    );
}
