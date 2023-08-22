var [handle] = await showOpenFilePicker({
    startIn: 'downloads',
    suggestedName: 'spd.txt'
});
var { lastModified } = await handle.getFile();
console.log(lastModified);
// FileSystemObserver() crashes tab on Linux, Crromium 118
(async () => {
    while (true) {
        const file = await handle.getFile();
        const { lastModified: modified } = file;
        if (modified > lastModified) {
            console.log(file.name, {
                modified,
                lastModified
            });
            break;
        }
        ;// console.log({modified, lastModified});
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    var text = atob(await (await handle.getFile()).text());
    local.setRemoteDescription({
        type: 'answer',
        sdp: text
    });
}
)().catch(console.log);

var local = new RTCPeerConnection({
    sdpSemantics: 'unified-plan',
});
['onsignalingstatechange', 'oniceconnectionstatechange', 'onicegatheringstatechange',].forEach((e) => local.addEventListener(e, console.log));

local.onicecandidate = async (e) => {
    if (!e.candidate) {
        local.localDescription.sdp = local.localDescription.sdp.replace(/actpass/, 'active');
        if (local.localDescription.sdp.indexOf('a=end-of-candidates') === -1) {
            local.localDescription.sdp += 'a=end-of-candidates\r\n';
        }
        try {
            console.log('sdp:', local.localDescription);
            var w = open(`isolated-app://<ID>>?sdp=${btoa(local.localDescription.sdp)}`);
        } catch (e) {
            console.error(e);
        }
    }
}
    ;
var channel = local.createDataChannel('transfer', {
    negotiated: true,
    ordered: true,
    id: 0,
    binaryType: 'arraybuffer',
    protocol: 'tcp',
});

channel.onopen = async (e) => {
    console.log(e.type);
}
    ;
channel.onclose = async (e) => {
    console.log(e.type);
}
    ;
channel.onclosing = async (e) => {
    console.log(e.type);
}
    ;
channel.onmessage = async (e) => {
    // Do stuff with data
    console.log(e.data);
}
    ;

var offer = await local.createOffer({
    voiceActivityDetection: false
});
local.setLocalDescription(offer);

// channel.send(JSON.stringify({type:'write', message:'test'}));
// channel.send(JSON.stringify({type:'close', message:''}));