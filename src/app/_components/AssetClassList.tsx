import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';

interface Account {
    name: string;
    allocation: number;
}

interface Fund {
    name: string;
    value: number;
}

interface AssetClass {
    name: string;
    funds: Fund[];
}

interface Portfolio {
    version: string;
    accounts: Account[];
    asset_classes: AssetClass[];
}

function initialAllocation(): Account[] {
    return [
        {
            name: 'Total World Stocks',
            allocation: 60,
        },
        {
            name: 'Bonds',
            allocation: 40,
        },
    ];
}

export default function AssetClassList() {
    const [assets, setAssets] = useState<Account[]>(initialAllocation);
    const [error, setError] = useState<string>('');

    const totalPercentage = assets.reduce((sum, asset) => sum + asset.allocation, 0);
    const isOverAllocated = totalPercentage > 100;

    const handleAddAsset = (): void => {
        setAssets([...assets, { name: '', allocation: 0 }]);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const updatedAssets = [...assets];
        const field = event.target.name;
        const value = event.target.value;
        const index = updatedAssets.findIndex((a) => a.name === field);
        const obj = updatedAssets[index];
        console.log(obj, index, field);
        (obj as any)[field] = field === 'allocation' ? Number(value) : value;
        console.log(event.target.parentElement);
        setAssets(updatedAssets);
    };

    const handleRemoveAsset = (index: number): void => {
        const updatedAssets = assets.filter((_, idx) => idx !== index);
        setAssets(updatedAssets);
    };

    const validateAndSubmit = (): void => {
        if (assets.some(asset => asset.name.trim() === '')) {
            setError('Asset class names cannot be blank.');
            return;
        }
        if (totalPercentage !== 100) {
            setError('Total allocation must sum to 100%.');
            return;
        }
        setError('');
    };

    return (
        <Box display="flex" justifyContent="center" mt={4}>
            <Paper elevation={3} sx={{ p: 4, width: '800px', borderRadius: 2 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Desired Allocation
                </Typography>
                {assets.map((asset, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                        <TextField
                            label="Asset Class"
                            name="name"
                            variant="outlined"
                            value={asset.name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="%"
                            name="allocation"
                            variant="outlined"
                            type="number"
                            value={asset.allocation}
                            onChange={handleChange}
                            slotProps={{
                                htmlInput: {
                                    step: 1,
                                    min: 1,
                                    max: 100,
                                }
                            }}
                            fullWidth
                        />
                        <IconButton onClick={() => handleRemoveAsset(index)} color="error">
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                ))}
                <Typography variant="body1" align="center" color={isOverAllocated ? 'error' : 'textPrimary'}>
                    Total Allocation: {totalPercentage}%
                </Typography>
                {error && (
                    <Typography variant="body2" color="error" align="center" mt={1}>
                        {error}
                    </Typography>
                )}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button variant="contained" color="primary" onClick={handleAddAsset}>Add Asset</Button>
                    <Button variant="contained" color="secondary" onClick={validateAndSubmit}>Apply</Button>
                </Box>
            </Paper>
        </Box>
    );
}
