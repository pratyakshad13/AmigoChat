let APP_ID="YOUR-ID"
let token=null;
let uid=String(Math.floor(Math.random()*10000));

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers= {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}

let init= async ()=>{

    client= await AgoraRTM.createInstance(APP_ID);
    await client.login({uid,token});

    channel= client.createChannel('main');
    await channel.join();

    channel.on('MemberJoined',handleUserJoin);

    client.on('MessageFromPeer',handleMessageFromPeer);

    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})
    document.getElementById('user-1').srcObject =localStream

   
}

let handleMessageFromPeer= async(message,MemberId)=>{
    message=JSON.parse(message.text)
    console.log('Message:',message)
}

let handleUserJoin =async(MemberId)=>{
    console.log('A new USer Joined the channel:',MemberId);
    createOffer(MemberId)
}


let createOffer= async (MemberId)=>{
    peerConnection=new RTCPeerConnection(servers);

    remoteStream= new MediaStream()
    document.getElementById('user-2').srcObject= remoteStream;


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream)
    });

    peerConnection.onTrack =(event)=>{
        event.stream[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track);
        })
    }

    peerConnection.onicecandidate =async (event)=>{
        if(event.candidate){
            client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberId)
        }
    }


    let offer=await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId)
}







init()
