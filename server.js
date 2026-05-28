const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Data File if not exists
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        vehicles: [
            { id: 'vehicle-1', vid: '#VH-001', plate: 'KA-01-AB-1234', type: 'Car', route: 'NH 275 → BM Expressway', fastag: 'FT-9876543210', status: 'Active', time: 'Today, 14:32' },
            { id: 'vehicle-2', vid: '#VH-002', plate: 'KA-03-CD-5678', type: 'Truck', route: 'NICE Road → NICE Road', fastag: 'FT-8765432109', status: 'Active', time: 'Today, 13:15' }
        ],
        // UPDATED ROUTES HERE
        fares: {
            'route-1': 150, // NH 275 → BM Expressway
            'route-2': 80,  // NICE Road → NICE Road
            'route-3': 60,  // Electronic City Elevated Expressway → ECE Expressway
            'route-4': 120, // Satellite Town Ring Road → STRR
            'route-5': 100  // Bengaluru–Chennai Expressway → BC Expressway
        }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// --- API ROUTES ---

// Get all data
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Add Vehicle
app.post('/api/vehicles', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const newVehicle = req.body;
        
        // Generate ID
        const count = data.vehicles.length + 1;
        newVehicle.id = `vehicle-${count}`;
        newVehicle.vid = `#VH-${String(count).padStart(3, '0')}`;
        
        data.vehicles.push(newVehicle);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add vehicle' });
    }
});

// Delete Vehicle
app.delete('/api/vehicles/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.vehicles = data.vehicles.filter(v => v.id !== req.params.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

// Update Fare
app.post('/api/fares', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const { id, amount } = req.body;
        
        if (data.fares[id] !== undefined) {
            data.fares[id] = amount;
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true, newAmount: amount });
        } else {
            res.status(404).json({ error: 'Fare ID not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update fare' });
    }
});

// Serve Frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});