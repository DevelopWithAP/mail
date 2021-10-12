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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // attach event listener to form
  const submitForm = document.querySelector('#compose-form');
  submitForm.addEventListener('submit', (event) => {
    // prevent default submission
    event.preventDefault();

    // collect form inputs
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // POST to the server
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then((response) => response.json())
      .then((result) => console.log(result));
    // load 'sent' box
    load_mailbox('sent');
  })


}

function load_mailbox(mailbox) {

  /*
  if mailbox = 'inbox':
      display email in appropriate background
        if user clicks on email:
          fetch all required email fields
          mark as read
      allow users to reply
      allow users to archive 

  else if mailbox = 'archive':
      show('archive')
      display email in appropriate background
      allow users to unarchive

  else if mailbox = 'sent':
      show('sent')  
  */

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // make the request for a specific mailbox
  fetch(`/emails/${mailbox}`)
  .then((response)=>response.json())
  .then((emails)=> {
    for (let email of emails) renderEmailList(email, mailbox);
  });
      
}

/** Helper function to construct the individual email div */
function renderEmailList(email, mailbox) {
  const emailsDiv = document.querySelector('#emails-view');
  const emailDiv = document.createElement('div');
  emailDiv.setAttribute('class', 'border rounded mb-1');
  email.read == false ? emailDiv.style.backgroundColor = 'white' : emailDiv.style.backgroundColor = 'lightgrey';
  emailDiv.innerHTML = `
    <div class="m-2" id="innerDiv">
      <p> <strong> ${email.sender} </strong> </p>
      <p> Subject: ${email.subject} </p>
      <hr>
      <small> Sent: ${email.timestamp} </small>
    </div>
    <hr>
  `;
  if (mailbox === 'inbox' && email.archived == false) {
    const archiveBtn = document.createElement('button');
    archiveBtn.setAttribute('class', 'btn btn-sm btn-primary m-2 archive');
    archiveBtn.innerHTML = 'archive';
    emailDiv.appendChild(archiveBtn);
    archiveBtn.addEventListener('click', ()=> archive(email.id));
  }
  else if (mailbox === 'archive') {
    const unarchiveBtn = document.createElement('button');
    unarchiveBtn.setAttribute('class', 'btn btn-sm btn-danger m-2 unarchive');
    unarchiveBtn.innerHTML = 'unarchive';
    emailDiv.appendChild(unarchiveBtn);
    unarchiveBtn.addEventListener('click', ()=> unarchive(email.id));
  }
  emailsDiv.appendChild(emailDiv);
  emailDiv.addEventListener('click', ()=> {
    displayEmail(email.id, mailbox);
    markAsRead(email.id)
  });

}

function displayEmail(email_id, mailbox) {
  document.querySelector('#emails-view').style.display= 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = '';
  fetch(`/emails/${email_id}`)
  .then((response)=> response.json())
  .then((email)=> {
    const infoDiv = document.createElement('div');
    infoDiv.setAttribute('class', 'border rounded mb-1');
    infoDiv.innerHTML = `
      <div class ="m-1">
        <p> <strong> ${email.sender} </strong> </p>
        <p>Recipients: ${email.recipients} </p>
        <p>Subject: ${email.subject} </p>
        <hr>
        <div>${email.body}</div>
        <hr>
        <small> Sent: ${email.timestamp} </small>
      </div>
    `;
    document.querySelector('#email-view').appendChild(infoDiv);
  })
}


/* Change the read boolean flag to true once the email has been clicked */
function markAsRead(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  });
}

/* Archive */
function archive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT', 
    body: JSON.stringify({
      archived: true
    })
  });
}

/* Unarchive */
function unarchive(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({ archived: false })
  });
}