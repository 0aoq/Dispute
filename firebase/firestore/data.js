const db = firebase.firestore()

const getString = function(length) {
    let result = []
    let characters = '!?@!??!!?@!?#$%@!?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
    }
    return result.join('')
}

auth.onAuthStateChanged((user) => {
    if (user) {
        db.doc("servers/dev").get().then((doc) => {
            let data = doc.data()

            for (datapoint of data.channels) {
                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                
                    <a style="display: flex;">${datapoint}</a>
                        
                `)
            }
        })

        db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set({
                    name: user.displayName,
                    server_verified: false,
                    sent: []
                })
            }
        })

        if (document.getElementById("page").innerHTML == "servers" && window.localStorage.getItem("current_channel")) {
            /* db.collection("servers/dev/general").get().then((querySnapshot) => { // DO NOT USE : NOT REALTIME : DOESN'T SUPPORT MULTIPLE CHANNELS
                querySnapshot.forEach((doc) => {
                    let data = doc.data()

                    for (datapoint of data.sent) {
                        document.getElementById("msgs").insertAdjacentHTML("beforeend", `
                
                            <li class="card message" style="margin-top: 5px; width: 99%;">
                                <h5 style="display: inline; user-select: none;">${data.name}</h5>
                                <span style="margin-left: 20px;">${datapoint}</span>
                            </li>
                        
                        `)
                    }
                });
            }); */

            db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`)
                .onSnapshot((querySnapshot) => { // Add real time support
                    querySnapshot.forEach((doc) => {
                        let data = doc.data()

                        for (datapoint of data.sent) {
                            let msg = datapoint.split("!SHITCORD_STORE/:shitcord_token:yXA?U::/")[0]
                            let code = datapoint.split("!SHITCORD_STORE/:shitcord_token:yXA?U::/")[1]
                            if (!document.getElementById(data.name + ":" + datapoint + ":" + code)) {
                                document.getElementById("msgs").insertAdjacentHTML("beforeend", `
                
                                    <li class="card message" style="margin-top: 5px; width: 99%;" id="${data.name + ":" + datapoint + ":" + code}">
                                        <h5 style="display: inline; user-select: none;">${data.name}</h5>
                                        <span style="margin-left: 20px;">${msg}</span>
                                    </li>
                            
                                `)
                            }
                        }
                    });
                }, (error) => {
                    console.log(error)
                });

            message_form.addEventListener('submit', e => {
                e.preventDefault()

                console.log("mmmmmm")

                if (message_form.msg.value != "" && message_form.msg.value != " " && message_form.msg.value != null && message_form.msg.value != "shitcord bad") {
                    db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let data = doc.data()

                            if (data.name == user.displayName) {
                                data.server_verified = true
                                data.sent.push(message_form.msg.value + "!SHITCORD_STORE/:shitcord_token:yXA?U::/" + getString(8))
                                db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set(data).then(() => {
                                    console.log("Written data.")
                                }).catch((error) => {
                                    console.log(error)
                                })
                            }
                        });
                    });

                    setTimeout(() => {
                        message_form.reset()
                    }, 100);
                }
            })
        }
    }
});
