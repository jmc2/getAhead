const express = require('express')
const app =     express();
const fs =      require('fs')

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(express.static('views'))


var plans     = [];     //  Contains all scheduled plans

//  ---- Sample Data ----

plans.push({ id: 0, plansData: [{ time: new Date(2022, 3, 5, 16, 30) , notes: "Meet hank" } ] }); 
plans.push({ id: 1, plansData: [{ time: new Date(2022, 4, 12, 19, 30) , notes: "Meet vedu"  } ] }); 
plans.push({ id: 2, plansData: [{ time: new Date(2022, 4, 16, 20, 30) , notes: "Meet meritith and fly kite" }, { time: new Date(2022, 4, 16, 21, 30) , notes: "jump off bridge" } ] }); 
plans.push({ id: 3, plansData: [{ time: new Date(2022, 4, 19, 20, 30) , notes: "throw a frisbee" }, { time: new Date(2022, 4, 19, 21, 30) , notes: "play ping pong with willy" } ] }); 
plans.push({ id: 4, plansData: [{ time: new Date(2022, 3, 24, 17, 20) , notes: "throw boomerang" }, { time: new Date(2022, 3, 8, 14, 30) , notes: "buy new paperclip" } ] }); 
//  ---- Sample Data ----


app.get('/month/:month', (req, res) => {

    res.render('index.ejs', { planData: getMonthPlans(plans, req.params.month), otherData: { currentTime: getShortTime(), currentMonth: getLongMonth(req.params.month), currentMonthNumber: req.params.month  } } )
})

app.get('/', (req, res) => {

   res.render('index.ejs', { planData: getMonthPlans(plans, getToday().getMonth()), otherData: { currentTime: getShortTime(), currentMonth: getLongMonth(getToday().getMonth()), currentMonthNumber: getToday().getMonth() } } )
})

app.get('/res/:dat', (req, res) => {

    // Ajax code to retrieve and change plans
 
    let dat = req.params.dat;
    let l = JSON.parse(dat)
    let subset = [];

    if(dat) {
        switch(l.a){

            case "del":

                for(let p of plans) {
               
                    if(p.id==l.b) {

                         p.plansData.splice(l.c,1);
                    }
                }
                res.send('done')
            break;

            case "ret":

                for(let p of plans) {
                
                    if(p.id==l.b) {

                            subset.push(p)
                            res.send(JSON.stringify(subset))
                    }
                }
            break;

            case "ins":

                    let newId = insertPlan(l.b, l.c, l.d, l.e, l.f, l.g )

                    if(newId) {
                    res.send(newId.toString()) } else {
                    res.send('done'); }
            break;
        }
    }
 })
 
let insertPlan = (id, notes, month, day, hour, minute) => {

    // Inserts a new plan into plans array

    if(id===null) {


            let newId = plans[plans.length-1].id + 1;

            plans.push({ id: newId, plansData: [{ time: new Date(2022, month, day, hour, minute), notes: notes }] })

            return newId;
 
    } else {
 
        let newDate = new Date(2022, month, day, hour, minute);

        for(p of plans) {

            if(p.id == id){

                p.plansData.every((a, i) => {

                    if(!a) return false;
                    let thisTime = a.time.getTime();


                    if ( newDate.getTime() <= thisTime) {

                        p.plansData.splice(i, 0, { time: newDate, notes: notes }  )
                       

                        return false;
                    } else if((p.plansData.length - 1) == i) {


                        p.plansData.push({ time: newDate, notes: notes})

                        return false;
                    }

                    return true;
                })

            }
        }
    }
}

let getToday = () => {

    let today = new Date();
    return today;
}

let getLongMonth = (month) => {

    let today = new Date();
    today.setMonth(month);

    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);
}

let getShortTime = () => {

    // Format time for view

    let today = new Date();
    let options = 
    { 
        weekday: 'long', 
        date: 'numeric', year: 'numeric', 
        timezone: ' UTC', timezonename: 'short', 
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        month: 'long', day: 'numeric'
    }

    return new Intl.DateTimeFormat('en-US', options).format(today);
}
 
let getFirstSunday = (month) => {

    // Return date of the first sunday of month

    let today = getToday(), i = 0;
    today.setDate(1);
    today.setMonth(month);

    while(today.getDay() != 0){
    i++;
    today.setDate(i);
    }
    return today.getDate();
}

let getLastDay = (month) => {

    // Return date of the last day of month

    let today = getToday(), i = 27;
    today.setDate(i);
    today.setMonth(month);

    while(today.getDate() != 1){
    i++;
    today.setDate(i);
    }
    return i-1;
}

let getPrependDates = (month) => {

    // Gets the dates for the selected month view 

    monthData= [];

    let today = getToday()
    today.setDate(1);
    today.setMonth(month);

    let firstSunday = getFirstSunday(month);
    let lastDayThis = getLastDay(today.getMonth());
    let lastDayPrev = getLastDay(today.getMonth()-1);
     
    if(firstSunday != 1) {

        let s =  8 - firstSunday; 

        for (let i = s; i > 0; i--) {

            monthData.push(lastDayPrev-(i-1))
        }
    }
 
    return monthData;
}

let getMonthPlans = (plans, month) => {

    // Returns all the plans for the selected month 

    let numDays = getLastDay(month);
    let a = [], b = [];
    let index = 1;


    for(let p of plans) {

        if(p.plansData[0]) {

            if(p.plansData[0].time.getMonth()==month) {   

                a[p.plansData[0].time.getDate()] = p ;       
            }
        }
    }
 

    for(let i = 1; i <= numDays; i++) {
        if(a[i]) {

            b[i]=a[i];
        } else {

            b[i]=i;
        }
    }
  
       if(getPrependDates(month).length) {
     
        b[50] = getPrependDates(month)
       }

    return b;
}



app.listen(3000)