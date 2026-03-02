'use client';
import React from 'react';
import Topbar from '../components/Topbar';
import LeftSidebar from '../components/LeftSidebar';
import FeedColumn from '../components/FeedColumn';
import RightSidebar from '../components/RightSidebar';

export default function HomePage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Topbar />
            <div
                className="main-layout"
                style={{
                    display: 'flex',
                    gap: 16,
                    padding: '72px 20px 0',
                    maxWidth: 1400,
                    margin: '0 auto',
                    alignItems: 'flex-start',
                    flex: 1,
                    width: '100%',
                    overflow: 'hidden',
                    height: 'calc(100vh - 56px)',
                }}
            >
                <div className="sidebar-left" style={{ display: 'flex' }}>
                    <LeftSidebar />
                </div>
                <div className="feed-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100%', minWidth: 0, paddingBottom: 20, gap: 14 }}>
                    <FeedColumn />
                </div>
                <div className="sidebar-right" style={{ display: 'flex' }}>
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
}
