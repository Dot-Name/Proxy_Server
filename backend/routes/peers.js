import express from 'express';
// import { execSync} from 'child_process';
import Peer from '../models/Peers.js';
// import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


router.post('/', async (req,res)=>res.json(await new Peer(req.body).save()));

router.get('/', async(req,res)=>res.json(await Peer.find()));

router.delete('/id/:id', async(req,res)=>{
  await Peer.findByIdAndDelete(req.params.id);
  res.send('Deleted');
});
import path from 'path';
import { exec, execSync } from 'child_process';

const vpnProcesses = new Map(); // peerId -> child process

router.post('/:id/start', async (req, res) => {
  const p = await Peer.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Peer not found' });

  // Cleanup old process when restarting
  if (vpnProcesses.has(p._id.toString())) {
    vpnProcesses.get(p._id.toString()).kill('SIGTERM');
    vpnProcesses.delete(p._id.toString());
  }

  const binPath = path.join(__dirname, '..', 'mainServer', 'vpn');
  const cmd = `sudo ${binPath} --peer ${p.ip}:${p.port} --psk ${p.psk}`;
  const child = exec(cmd);
  vpnProcesses.set(p._id.toString(), child);

  // Delay route setup until tun0 ready (simple delay or improved check)
  setTimeout(() => {
    try {
      execSync('sudo ip route replace default dev tun0');
    } catch (e) {
      console.error('Failed to set route:', e);
    }
  }, 1000);

  child.on('exit', () => {
    vpnProcesses.delete(p._id.toString());
    // Optionally mark peer inactive here with DB update
  });

  p.isActive = true;
  await p.save();
  res.json({ message: 'VPN started' });
});

router.post('/:id/stop', async (req, res) => {
  try {
    const p = await Peer.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Peer not found' });

    if (vpnProcesses.has(p._id.toString())) {
      vpnProcesses.get(p._id.toString()).kill('SIGTERM');
      vpnProcesses.delete(p._id.toString());
    }

    // Use try-catch for commands which may fail
    try {
      execSync('sudo ip link delete tun0 2>/dev/null');
    } catch (e) {
      console.warn('tun0 interface delete failed or already removed:', e.message);
    }

    try {
      execSync(`
        sudo iptables -t nat -D POSTROUTING -s 10.8.0.0/16 ! -d 10.8.0.0/16 -m comment --comment 'vpndemo' -j MASQUERADE 2>/dev/null;
        sudo iptables -D FORWARD -s 10.8.0.0/16 -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null;
        sudo iptables -D FORWARD -d 10.8.0.0/16 -j ACCEPT 2>/dev/null;
      `);
    } catch (e) {
      console.warn('iptables cleanup failed or nothing to delete:', e.message);
    }

    try {
      execSync('sudo ip route replace default via 10.133.127.254 dev wlo1');
    } catch (e) {
      console.warn('Failed to restore default route:', e.message);
    }

    p.isActive = false;
    await p.save();

    res.json({ message: 'VPN stopped and cleaned up' });
  } catch (error) {
    console.error('Stop handler error:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
