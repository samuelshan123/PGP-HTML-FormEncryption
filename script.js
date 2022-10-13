var user1;
var user2;
window.onload = async function () {
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
    user1 = await generateKeys('user1', 'user1@mail.com')

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
            user2 = await generateKeys(payload.name, payload.email)
            await encrypt(JSON.stringify(payload))
        }

    });
}

async function encrypt(payload) {

    console.log(user2);

    const receiverPrivateKeyObject = await openpgp.readKey({
        armoredKey: user1.private,
    })
    const receiverPublicKeyObject = await openpgp.readKey({
        armoredKey: user1.public,
    })

    const senderPrivateKeyObject = await openpgp.readKey({
        armoredKey: user2.private,
    })
    const senderPublicKeyObject = await openpgp.readKey({
        armoredKey: user2.public,
    })

    console.log(senderPublicKeyObject);


    // Encrypting message with User1 private key
    const encryptedMessage = await openpgp.encrypt({
        message: await openpgp.createMessage({
            text: payload,
        }),
        encryptionKeys: senderPublicKeyObject,
        signingKeys: receiverPrivateKeyObject,
    })
    console.log(encryptedMessage);

    // Decrypting message

    // Creating Message object from armored string
    const encryptedMessageObj = await openpgp.readMessage({
        armoredMessage: encryptedMessage,
    })

    // Decrypting Message object with User2 Private Key Object
    const decryptedMessage = await openpgp.decrypt({
        message: encryptedMessageObj,
        decryptionKeys: senderPrivateKeyObject,
    })

    console.log(decryptedMessage)
}