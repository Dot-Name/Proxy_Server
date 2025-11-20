import React, { useState } from 'react';
import axios from 'axios';
export default function(){
  const [f, setF]=useState({name:'',ip:'',port:0,psk:''});
  const submit=()=>axios.post('/api/peers',f).then(()=>window.location.reload());
  return (
    <div>
      <input placeholder="Name" onChange={e=>setF({...f,name:e.target.value})}/>
      <input placeholder="IP" onChange={e=>setF({...f,ip:e.target.value})}/>
      <input placeholder="Port" type="number" onChange={e=>setF({...f,port:+e.target.value})}/>
      <input placeholder="PSK" onChange={e=>setF({...f,psk:e.target.value})}/>
      <button onClick={submit}>Add Peer</button>
    </div>
  );
}
