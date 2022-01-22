document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#email-view").style.display = "none";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const submitForm = document.querySelector("#compose-form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;


    fetch("/emails", {
      method: "POST", 
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
      })
    })
    .then(response => response.json())
    .then(result => console.log(result));
  sendSuccess();
  load_mailbox("sent");  
  })
  
}

/** Helper function to flash success div */
const sendSuccess = ()=> {
  const successDiv = document.querySelector('#success-msg');
  successDiv.style.display = 'block';
  setTimeout(()=> {
    successDiv.style.transition = '.5s';
    successDiv.style.opacity = '0';
    successDiv.style.display = 'none';
  }, 2000);
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `
  <h3 class="text-center">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3> <hr/>`;
 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    for (let item of data) {
      showEmailList(item, mailbox);
    }
  })

}

/* helper function to construct the inbox default view */
function showEmailList(item, mailbox) {
  const emailsView = document.querySelector("#emails-view");

  /* div displaying individual mailbox email */
  const emailDiv = document.createElement("div");
  emailDiv.setAttribute("class", "border mt-1 mb-1");
  
  /* display email in appropriate background colour depending on it 'read' status */
  item.read == false ? emailDiv.style.backgroundColor = "white" : emailDiv.style.backgroundColor = "gainsboro";

  /* Populate emailDiv with the appropriate information */
  emailDiv.innerHTML = `
    <div class="mx-3">  
      <p class="my-1"> <strong> ${item.sender} </strong> | ${item.subject} | ${item.timestamp} </p>
    </div>
  `;

  emailDiv.onclick = () => {
    showEmail(item.id, mailbox);
    markAsRead(item.id);
  }
  emailsView.appendChild(emailDiv);
}

/** Display individual email  */
function showEmail(item_id, mailbox) {

  const emailView = document.querySelector("#email-view");
  const emailsView = document.querySelector("#emails-view");

  /** Hide main mailbox div */
  emailsView.style.display = 'none';
  emailView.style.display = 'block';
  emailView.innerHTML = "";

  /** Holds the email info as well as required buttons
   * depending on the mailbox
   */

  const mainDiv = document.createElement("div");
  fetch(`/emails/${item_id}`)
  .then(response => response.json())
  .then(item => {
    const mainDiv = document.createElement("div");
    mainDiv.innerHTML = `
      <div class="m-1" id="innerDiv">
        <p><strong> From: </strong>${item.sender}</p>
        <p><strong> To: </strong>${item.recipients}</p>
        <p><strong> Subject: </strong>${item.subject}</p>
        <p><strong> Timestamp: </strong>${item.timestamp}</p>
      </div>
      <hr>
    `;
    const buttons = document.createElement("div");
    setAttributes(buttons, {"class": "btn-group", "role": "group"});

    const archBtn = document.createElement("button");
    archBtn.setAttribute("class", "btn btn-outline-info btn-sm");

    item.archived == false ? archBtn.innerText = "Archive" : archBtn.innerText = "Unarchive"; 
    archBtn.addEventListener("click", ()=> {
      toggleArchive(item.id);
    });

    const replyBtn = document.createElement("button");
    replyBtn.setAttribute("class", "btn btn-sm btn-outline-primary ml-1");
    replyBtn.innerText = "Reply";

    const infoDiv = document.createElement("div");
    infoDiv.setAttribute("class", "m-1")
    infoDiv.innerText = item.body;
    mainDiv.appendChild(infoDiv);

    emailView.appendChild(mainDiv);
    
    replyBtn.addEventListener("click", ()=> {
      compose_email();

      document.querySelector("#compose-recipients").value = item.sender;

      if (!item.subject.startsWith("Re:")) {
        document.querySelector("#compose-subject").value = `Re: ${item.subject}`;
      }
      else {
        let split = item.subject.split("Re:");
        let target = split[1].trim();
        document.querySelector("#compose-subject").value = target;
      }

      const preFill = `\n===On ${item.timestamp} ${item.sender} wrote:===\n`;
      document.querySelector("#compose-body").value = preFill + item.body;

      /** Ensure reply compositon starts at the top of the textarea */
      document.querySelector("#compose-body").onclick = () => {
        document.querySelector("#compose-body").setSelectionRange(0,0);
      };
    });

    if (mailbox === "inbox" || mailbox === "archive"){
      buttons.appendChild(archBtn);
      buttons.appendChild(replyBtn);
    }
    else {
      buttons.parentNode.removeChild(buttons);
    }
    document.querySelector("#innerDiv").appendChild(buttons);
  });
}

/**  Helper function to set multiple element attributes */
function setAttributes(element, attributes) {
  for (let key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

/** Mark email as read */
function markAsRead(item_id) {
  fetch(`/emails/${item_id}`, {
    method: "PUT", 
    body: JSON.stringify({
      read: true
    })
  })
  .catch(error => console.log(error));
}

/** Toggle the 'archived' flag */
function toggleArchive(item_id) {
  fetch(`/emails/${item_id}`)
  .then(response => response.json())
  .then(item => {
    fetch(`/emails/${item.id}`, {
      method: "PUT", 
      body: JSON.stringify({ archived: !item.archived })
    })
    .then(()=> load_mailbox("inbox"));
  })
  .catch(error => console.log(error));
}

