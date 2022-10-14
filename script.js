var receiver;
var sender;
var encryptedMessage;
var senderPrivateKeyObject;
window.onload = async function () {

    document.getElementById('output').style.display="none";
    async function generateKeys(name, email) {
        const key = await openpgp.generateKey({
            userIDs: [{
                name: name,
                email: email
            }],
        })
        document.getElementById('public_key').innerHTML = key.publicKey
        console.log(key);
        return {
            public: key.publicKey,
            private: key.privateKey
        }
    }
    receiver = await generateKeys('receiver', 'receiver@mail.com')

    document.getElementById("encrypt").addEventListener("click", async function (event) {
        event.preventDefault()

        let receiver_public_key = document.getElementById('public_key').value
        let payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
        }

        if (!payload.name || !payload.email || !payload.message || !receiver_public_key) {
            alert("fields cant be empty")
        } else {
            sender = await generateKeys(payload.name, payload.email)
            await encrypt(JSON.stringify(payload))
        }

    });

    document.getElementById("decrypt").addEventListener("click", async function (event) {
        event.preventDefault()
        decrypt()
    })
    
}

async function encrypt(payload) {
    console.log(sender);
    const receiverPrivateKeyObject = await openpgp.readKey({
        armoredKey: receiver.private,
    })
    const receiverPublicKeyObject = await openpgp.readKey({
        armoredKey: receiver.public,
    })
  senderPrivateKeyObject = await openpgp.readKey({
        armoredKey: sender.private,
    })
    const senderPublicKeyObject = await openpgp.readKey({
        armoredKey: sender.public,
    })
    console.log(senderPublicKeyObject);
     encryptedMessage = await openpgp.encrypt({
        message: await openpgp.createMessage({
            text: payload,
        }),
        encryptionKeys: senderPublicKeyObject,
        // signingKeys: receiverPrivateKeyObject,
    })
    console.log(encryptedMessage);
    document.getElementById('encrypted_message').innerHTML=encryptedMessage
}


async function decrypt(){
 
    const encryptedMessageObj = await openpgp.readMessage({
        armoredMessage: encryptedMessage,
    })

    console.log(senderPrivateKeyObject);

   
 const decryptedMessage = await openpgp.decrypt({
    message: encryptedMessageObj,
    decryptionKeys: senderPrivateKeyObject,
})
var result =JSON.parse(decryptedMessage.data)
document.getElementById('output').style.display="block";

document.getElementById('d_name').innerHTML=`Name: ${result.name}`;
document.getElementById('d_email').innerHTML=`Email: ${result.email}`;
document.getElementById('d_message').innerHTML=`Message: ${result.message}`;


console.log(decryptedMessage)
}