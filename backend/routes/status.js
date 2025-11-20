import express from 'express';
import { exec } from 'child_process';
const router = express.Router();


router.get('/', (req, res) => {
  exec('curl -s ifconfig.me', (err, stdout) => {
    const publicIP = err ? 'Error' : stdout.trim();
    // Check tun0 status
    exec('ip addr show tun0', (e2, out2) => {
      const vpnStatus = e2 ? 'Inactive' : 'Active';
      const vpnIPMatch = out2.match(/inet (\\d+\\.\\d+\\.\\d+\\.\\d+)/);
      const vpnIP = vpnIPMatch ? vpnIPMatch[1] : 'N/A';
      res.json({
        publicIP,
        vpnStatus,
        vpnIP,
        timestamp: new Date().toISOString()
      });
    });
  });
});

export default router;