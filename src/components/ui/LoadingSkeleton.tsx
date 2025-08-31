import { Paper, Skeleton, Stack } from '@mantine/core';
import { memo } from 'react';

interface LoadingSkeletonProps {
    height?: number;
    rows?: number;
    withBorder?: boolean;
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(function LoadingSkeleton({ 
    height = 200,
    rows = 3,
    withBorder = true
}) {
    return (
        <Paper 
            shadow="xl" 
            withBorder={withBorder} 
            p="xl" 
            style={{ minHeight: height }}
        >
            <Stack gap="md">
                <Skeleton height={24} width="40%" />
                {Array.from({ length: rows }, (_, index) => (
                    <Skeleton key={index} height={40} />
                ))}
                <Skeleton height={36} width="30%" />
            </Stack>
        </Paper>
    );
});

export const SettingsLoadingSkeleton = memo(function SettingsLoadingSkeleton() {
    return (
        <Stack gap="xl">
            <LoadingSkeleton height={150} rows={2} />
            <LoadingSkeleton height={300} rows={4} />
            <LoadingSkeleton height={200} rows={3} />
        </Stack>
    );
});
