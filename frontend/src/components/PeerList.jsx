import React, {useEffect,useState} from 'react';
import axios from 'axios';
export default function(){
  const [peers,setPeers]=useState([]);
  useEffect(()=>axios.get('/api/peers').then(r=>setPeers(r.data)),[]);
  const toggle=(id,act)=>axios.post(`/api/peers/${id}/${act}`)
    .then(()=>axios.get('/api/peers').then(r=>setPeers(r.data)));
  return (
    <ul>
      {peers.map(p=>(
        <li key={p._id}>
          {p.name} {p.ip}:{p.port} {p.isActive?'🟢':'🔴'}
          <button onClick={()=>toggle(p._id,p.isActive?'stop':'start')}>
            {p.isActive?'Stop':'Start'}
          </button>
        </li>
      ))}
    </ul>
  );
}
