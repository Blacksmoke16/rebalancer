import { useState, useEffect } from 'react';

const TAB_STORAGE_KEY = 'rebalancer-active-tab';

export function useTabPersistence(defaultTab = 'home') {
    const [activeTab, setActiveTab] = useState<string>(() => {
        try {
            return localStorage.getItem(TAB_STORAGE_KEY) ?? defaultTab;
        } catch {
            return defaultTab;
        }
    });

    const handleTabChange = (value: string | null) => {
        const newTab = value ?? defaultTab;
        setActiveTab(newTab);
    };

    useEffect(() => {
        try {
            localStorage.setItem(TAB_STORAGE_KEY, activeTab);
        } catch {
            // Ignore localStorage errors
        }
    }, [activeTab]);

    return [activeTab, handleTabChange] as const;
}
