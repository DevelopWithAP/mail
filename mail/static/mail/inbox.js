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
    .then((response) => response.json())
    .then((emails) => {
      for (let email of emails){
          renderEmail(email);
      }
    })
      
}

/** Helper function to construct the individual email div */
function renderEmail(email, mailbox) {
  const emailDiv = document.createElement('div');
  emailDiv.setAttribute('class', 'border rounded mb-2');
  emailDiv.setAttribute('id', 'emailDivId');
  emailDiv.innerHTML += 
  `
    <div class="m-2">
    <h5>${email.sender}</h5>
    <p>Subject: ${email.subject}</p>
    <hr>
    <small>Sent: ${email.timestamp}</small>
    </div>
  `;
  
  document.querySelector('#emails-view').append(emailDiv);
  emailDiv.addEventListener('click', ()=> displayEmail(email.id, mailbox));
}

function displayEmail(email_id, mailbox) {
  markAsRead(email_id);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = '';
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      const infoDiv = document.createElement('div');
      infoDiv.setAttribute('class', 'border');
      infoDiv.innerHTML +=
      `
      <div class="m-1">
      <h5>${email.sender}</h5>
      <p>Subject: ${email.subject}</p>
      <p>Recipients: ${email.recipients}</p>
      <div> ${email.body} </div>
      <hr>
      <small>Sent: ${email.timestamp}</small>
    `;
    document.querySelector('#email-view').append(infoDiv);
  });
}


/* Change the read boolean flag to true once the email has been clicked */
function markAsRead(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  const emailDiv = document.querySelector('#emailDivId');
  fetch(`/emails/${email_id}`)
  .then((response)=>response.json())
  .then((email)=> email.read ? emailDiv.style.backgroundColor = 'white': emailDiv.style.backgroundColor = 'grey');
  
}