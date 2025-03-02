import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

export const StoringProcess = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
        >
            <CircularProgress size={80} />
            <Typography variant="h4" marginTop={2}>
                Storing item
            </Typography>
        </Box>
    );
};
