<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="favicon">
    <title>Viewing Dispute</title>

    <link rel="stylesheet" href="src/styles.css">
    <link rel="stylesheet" href="src/app.css">
    <link rel="stylesheet" href="src/css/whitespace.css">

    <script src="https://c-zero.web.app/js/brickjs.js"></script>

    <script src="https://unpkg.com/feather-icons"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" defer></script>
    <link rel="shortcut icon" type="image/jpg" href="src/dispute_favicon.svg" />

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-analytics.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-firestore.js"></script>
</head>

<body style="height: 100%; display: block; background: var(--background-darkest);">
    <datalist id="auth_required">true</datalist>
    <datalist id="page">servers</datalist>
    <input type="text" style="display: none;" id="copy_server_code">
    <div class="container-2">
        <div class="sidebar menu" id="sidebar" style="width: 75px;">
            <a style="margin: 0;" class="server_icon" onclick="togglesidebar()" id="mobile_sidebar"><i data-feather="menu"></i></a>
            <a style="margin: 0;" class="server_icon" onclick="open_new_server_modal()">Join</a>
            <a style="margin: 0; margin-bottom: 20px;" class="server_icon" onclick="open_server_modal()">New</a>

            <div id="servers_list"></div>
        </div>

        <div class="sidebar menu sidebar-2">
            <a id="server_name">Loading...</a>

            <a id="newchannel" style="display: none;">Make Channel</a>
            <a id="newchannel__form" style="display: none;">
                <form id="newchannel__form_set">
                    <p>Name</p>
                    <input type="text" name="channel" autocomplete="off" required>
                    <p>Type</p>
                    <select name="type" required aria-placeholder="Choose a channel type">
                        <option selected disabled> 
                            Choose a channel type
                        </option> 
                        <option>Chat</option>
                        <option>Announcements</option>
                    </select>
                    <button>Create</button>
                </form>
            </a>

            <div id="channels"></div>

            <div class="panel-1" aria-label="user_section" id="user_info">
                <h4>Loading...</h4>
                <a aria-label="sign_out" class="btn" style="margin-left: 15px;"><i data-feather="log-out"></i></a>
                <a class="btn" style="margin-left: 15px;" aria-label="account settings" onclick="open_settings_modal()"><i data-feather="settings"></i></a>
            </div>
        </div>

        <div id="server_info" class="sidebar menu" style="background: none;">
            <a id="server_info__channel_name" class="no_effect">Loading...</a>

            <div class="messages">
                <ul style="list-style: none; margin-top: 50px;">
                    <li style="text-align: center; color: white; margin-bottom: 20px;">
                        <h2 id="channel__name__2">Dispute/Home</h2><br>
                        <h3 style="color: lightgray;">Start a conversation</h3>
                    </li>
                </ul>

                <ul style="list-style: none; height: 82vh; overflow: hidden auto;" id="msgs"></ul>

                <ul style="list-style: none;">
                    <li class="card" id="messagebox" style="width: 99%; display: none;">
                        <form style="display: flex;" id="message_form">
                            <textarea name="msg" style="width: 90%; display: inline; resize: none;"></textarea>
                            <button style="width: 10vw; display: inline; margin-bottom: 1.2rem; margin-left: 10px;"><i data-feather="send" style="font-size: 3vh;">Loading</i></button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div id="server_modal" class="modal box-shadow" style="overflow: hidden;">
        <div class="modal-content">
            <a class="close" id="server_close">&times;</a>
            <br>
            <form id="new_server_form">
                <h2>Start A Community</h2>

                <p style="color: white; text-align: left;">Server Name</p>
                <input type="text" name="servername" autocomplete="off">

                <p style="color: white; text-align: left;">Picture URL</p>
                <input type="url" name="picurl" autocomplete="off" disabled>

                <br>
                <button>Create</button>
            </form>
        </div>
    </div>

    <div id="join_server_modal" class="modal box-shadow" style="overflow: hidden;">
        <div class="modal-content">
            <a class="close" id="join_server_close">&times;</a>
            <br>
            <form id="join_server_form">
                <h2>Join A Community</h2>

                <p style="color: white; text-align: left;">Server Code</p>
                <input type="text" name="servercode" autocomplete="off">

                <br>
                <button>Join</button>
            </form>
        </div>
    </div>

    <div id="settings_modal" class="modal" style="overflow: hidden;">
        <div class="modal-content">
            <a class="close" id="settings_modal_close">&times;</a>
            <br>
            <form id="signupform" style="width: 100%;">
                <p style="color: white; text-align: left;">Change Email</p>
                <input type="email" name="email" autocomplete="off" required>
                <button>Change</button>
            </form>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script src="src/firebase/firebase-init.js"></script>
    <script src="src/firebase/users/auth.js"></script>
    <script src="src/firebase/firestore/data.js"></script>

    <script>
        feather.replace();
        // Message Sending
        const message_form = document.getElementById("message_form")
        let shift = false
        document.querySelector("textarea").addEventListener('keydown', e => { // Check for shift submit
            if (e.key == "Enter") {
                if (!shift) {
                    document.querySelector(`#${message_form.id} button`).click() // .submit() ignores preventDefault()
                }
            } else if (e.key == "Shift") {
                shift = true

                setTimeout(() => {
                    shift = false
                }, 50);
            }
        })

        // New Server Modal

        let server_modal = document.getElementById("server_modal");
        var server_close = document.getElementsByClassName("close")[0];

        function open_server_modal() {
            server_modal.style.display = "grid";
        }

        server_close.onclick = function() {
            server_modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == server_modal) {
                server_modal.style.display = "none";
            } else if (event.target == new_server_modal) {
                new_server_modal.style.display = "none";
            } else if (event.target == settings_modal) {
                settings_modal.style.display = "none"
            }
        }

        let new_server_modal = document.getElementById("join_server_modal");
        var new_server_close = document.getElementById("join_server_close");

        function open_new_server_modal() {
            new_server_modal.style.display = "grid";
        }

        new_server_close.onclick = function() {
            new_server_modal.style.display = "none";
        }

        let settings_modal = document.getElementById("settings_modal");
        var settings_modal_close = document.getElementById("settings_modal_close");

        function open_settings_modal() {
            settings_modal.style.display = "grid";
        }

        settings_modal_close.onclick = function() {
            settings_modal.style.display = "none";
        }

        // Invites

        auth.onAuthStateChanged((user) => {
            if (user) {
                let id = window.location.search.slice(1)

                if (id) {
                    console.log("checked invite")
                    db.collection("servers").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let data = doc.data()
                            let doc_code = doc.id.split("!:DISPUTE_SERVER::GET::!?")[1]

                            if (doc_code == id) {
                                if (!data.users.includes(user.uid)) {
                                    data.users.push(user.uid)
                                    db.collection("servers").doc(doc.id).set(data).then(() => {
                                        console.log("Written data.")
                                        if (confirm("You have successfully joined the server, switch to it now?")) {
                                            window.localStorage.setItem("current_server", doc.id)
                                            window.localStorage.setItem("current_channel", "general")
                                            window.location = "app"
                                        }
                                    }).catch(error => {
                                        console.log(error)
                                    })
                                } else {
                                    alert("Failed to join: You are already in this server.")
                                }
                            }
                        })
                    })
                }
            }
        });

        // Mobile channel bar

        function togglesidebar() {
            if (document.querySelector(".sidebar-2").style.display === "none") {
                document.querySelector(".sidebar-2").style.display = "block"
                document.querySelector("#server_info").style.width = "83.5vw"
            } else {
                document.querySelector(".sidebar-2").style.display = "none"
                document.querySelector("#server_info").style.width = "100vw"
            }
        }

        // console.log

        let console_styles = {
            base: [
                "color: #fff",
                "background-color: #444",
                "padding: 2px 4px",
                "border-radius: 2px"
            ],
            warning: [
                "color: #eee",
                "background-color: #ff4747"
            ],
            success: [
                "background-color: green"
            ]
        }
        let log = (text, extra = []) => {
            let style = console_styles.base.join(';') + ';';
            style += extra.join(';');
            console.log(`%c${text}`, style);
        }
    </script>
</body>

</html>
