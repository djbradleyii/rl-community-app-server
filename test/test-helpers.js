
function makeUsersArray(){
    return [
        {
            fname : "Rick",
            lname : "Mcqueeney",
            dob : '10/10/1980',
            email : "rmcqueeney@gmail.com",
            password : "password1",
            marital_status : "Married",
            occupation : "Marketing",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '12/30/2019'
        },
        {
            fname : "Summer",
            lname : "Lane",
            dob : '10/10/1980',
            email : "slane@gmail.com",
            password : "password2",
            marital_status : "Married",
            occupation : "Fashion Designer",
            gender : "Female",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '12/30/2019'
        },
        {
            fname : "Larry",
            lname : "Savage",
            dob : '10/10/1980',
            email : "lsavage@aol.com",
            password : "password3",
            marital_status : "Widow",
            occupation : "Construction",
            gender : "Male",
            bio : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.", 
            date_created: '12/30/2019'
        },
    ];
}
  
  function makeEventsArray(){
    return [
        {
            organizer : 1,
            title : "Event 1 Title",
            event_purpose : "Singles Night",
            restaurant : "Sonora Town",
            address : "321 4th St, Los Angeles, CA 90003",
            date : '10/31/2020',
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: '12/31/2019'
        },
        {
            organizer : 2,
            title : "Event 2 Title",
            event_purpose : "Game Night",
            restaurant : "Button Mash",
            address : "123 2nd St, Los Angeles, CA 90001",
            date : '10/31/2020',
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: '12/31/2019'
        },
        {
            organizer : 3,
            title : "Event 3 Title",
            event_purpose : "Networking",
            restaurant : "Water Grill",
            address : "30923 Union Ave, Los Angeles, CA 90301",
            date : '10/31/2020',
            time : "18:00:00",
            description : "Nam ullamcorper finibus purus, id facilisis nisi scelerisque in. Aliquam vel nisi id tellus efficitur sagittis. Sed vel maximus erat. Nunc dapibus purus massa, in molestie ipsum gravida vel. Phasellus varius nec risus a ornare.",
            singles_only : false, 
            date_created: '12/31/2019'
        },
    ];
}
  
  function makeAttendeesArray() {
    return [
      {
        user_id:1,
        event_id:1
      },
      {
        user_id:1,
        event_id:2
      },
      {
        user_id:1,
        event_id:3
      },
      {
        user_id:2,
        event_id:1
      },
      {
        user_id:2,
        event_id:2
      },
      {
        user_id:3,
        event_id:3
      },
      {
        user_id:3,
        event_id:1
      },
    ];
  }
  
  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE 
            attendees, 
            events, 
            users RESTART IDENTITY CASCADE
        `
      )
    )
  }
  
  function seedAllTables(db, users, events=[], attendees=[]) {
    // use a transaction to group the queries and auto rollback on any failure
    const users = makeUsersArray();
    const events = makeEventsArray();
    const attendees = makeAttendeesArray();

    return db.transaction(async trx => {
      await trx.into('users').insert(users)
      await trx.into('events').insert(events)
      await trx.into('attendees').insert(attendees)
      // only insert comments if there are some, also update the sequence counter
      if (events.length) {
        await trx.into('events').insert(events)
      }
    })
  }

  function makeAuthHeader(user) {
    const token = Buffer.from(`${user.email}:${user.password}`).toString('base64')
    return `Bearer ${token}`
  }
  
  module.exports = {
    makeUsersArray,
    makeEventsArray,
    makeAttendeesArray,
    cleanTables,
    seedAllTables
  }
  