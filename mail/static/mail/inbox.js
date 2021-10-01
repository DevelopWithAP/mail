document.addEventListener('DOMContentLoaded', function() {

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
        recipients:recipients,
        subject: subject,
        body: body
      })
    })
    .then((response)=> response.json())
    .then((result)=> console.log(result));
    // load 'sent' box
    load_mailbox('sent');
  })


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // make the request for a specific mailbox
  fetch(`/emails/${mailbox}`)
  .then((response)=>response.json())
  .then((emails)=>{
    let emailDiv = document.createElement('div');
    emailDiv.setAttribute('class', 'border rounded mb-2');
    emailDiv.setAttribute('id', 'emailDivId');
    for (let email of emails) {
      // render div for a specific email
      // let emailDiv = document.createElement('div');
      // emailDiv.setAttribute('class', 'border rounded mb-2');
      // emailDiv.setAttribute('id', 'emailDivId');
      emailDiv.innerHTML = `
        <h5 style="margin-left: 4px;"> ${email.sender} </h5>
        <p style="margin-left: 4px;"> Subject: ${email.subject} </p>
        <small style="margin-left: 4px;"> Sent: ${email.timestamp} </small>
      `;
      document.querySelector('#emails-view').append(emailDiv);
      emailDiv.addEventListener('click', ()=> displayEmail(email.id));
    }
  });
} 

function displayEmail(id){
  
}