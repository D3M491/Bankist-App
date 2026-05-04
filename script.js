'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2026-04-27T17:01:17.194Z',
    '2026-04-28T23:36:17.929Z',
    '2026-05-02T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//Separated function for formatting dates to day/month/year
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const dayPassed = calcDaysPassed(new Date(), date);
  console.log(dayPassed);

  if (dayPassed === 0) return 'Today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed <= 7) return `${dayPassed} days ago`;
  //Only then we return the actual date
  else {
    //We add the locale argument to the function , then when we call it we pass it the local of the curr account . Then the locale is formatted passing the date
    return new Intl.DateTimeFormat(locale).format(date);
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;
  }
};

//Passing all values so the function is reusable
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//Fix sorting bug passing the entire acc tio the function and creating an object passing dates
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //We build a object using map , passing the movements and their date
  //we need to wrap the object in the parentesis!!
  const combinedMovsdates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  console.log(combinedMovsdates);

  //Se sorted e vero allora ordina i combinedMov
  if (sort) combinedMovsdates.sort((a, b) => a.movement - b.movement);

  //Old way
  // const movs = sort
  //   ? acc.movements.slice().sort((a, b) => a - b)
  //   : acc.movements;

  //Per ogni movimento
  combinedMovsdates.forEach(function (obj, i) {
    //Destructuring object
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(movementDate);
    const formattedMovement = formatCur(obj.movement, acc.locale, acc.currency);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
      <div class="movements__row">
      
      <div class="movements__type movements__type--${type}">${
        i + 1
      } ${type}</div>
      
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>

      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Balance calculations
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(acc.balance, acc.locale, acc.currency)}`;
};

//Incomes calculations
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  //Outcomes calculations
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(Math.abs(out), acc.locale, acc.currency)}`;

  //Interest calculations
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(interest, acc.locale, acc.currency)}`;
};

const createUsernames = function (acc) {
  acc.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    //sec are the remaining time from the previous operation
    const sec = String(time % 60).padStart(2, 0);
    //On each call print remaining time
    labelTimer.textContent = `${min}:${sec}`;
    //When 0s , stop timer and logout
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }
    //Decrease 1s
    time--;
  };
  //Setting time to 5mins in seconds ( now using 100 to test)
  let time = 120;

  //Call the timer every sec
  //BUG , after ending , the time we login again , the timer will take some time to restart , this is the solution : calling it immediately then passin it to the set interval
  tick();
  const timer = setInterval(tick, 1000);
  //Return so the execution ends
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value,
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Expermimenting with api
    const now = new Date();
    //Options object
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    // const locale = navigator.language;
    // console.log(locale);

    //Internationalization using Intl + date time format . We pass a string containing the language and the country . On it we call the format function passing the date

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options,
    ).format(now);

    // //Create current date and time old way
    // //We want this format = day , month and year
    // //We need to pad start on a string so we use template literal
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hours = now.getHours();
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //First we need to check if there's an existing timer running
    if (timer) clearInterval(timer);
    //Setting timer as new
    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value,
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Resetting timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.round(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date . We use to iso because its the same format as movementDates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      //Resetting timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
    inputLoanAmount.value = '';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username,
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

//Fake always login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(20 === 20.0);
// console.log(0.1 + 0.2);

// console.log(Number('23'));
// //Easier way
// console.log(+'23');
// //Parsing :
// //Parse int : to work the string need to start with a number
// console.log(Number.parseInt('30px', 10)); //With number from 0-9 we use 10 , with binary numbers we use 2

// //Parse int accept a second argument wich is called regex : base of the numeral system that we are using . In this case : 10

// //ParseFloat
// console.log(Number.parseFloat('2.5rem')); //We get 2.5
// console.log(Number.parseInt('2.5rem')); //We get only 2

// //Is nan try to see if the argument is a number or not
// console.log(Number.isNaN(+'2x')); // not a number because 2x is the number we created with +
// console.log(Number.isNaN(23 / 0));

// //Is finite ( best way to check if a value is a number)
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(20));
// console.log(Number.isFinite(+'2x'));

// // is integer
// console.log(Number.isFinite(+'2x'));

// //Math and rounding

// //Sqrt radice
// console.log(Math.sqrt(25));

// //Cubic radice
// console.log(25 ** 1 / 3);

// //Math max and min
// console.log(Math.max(5, 19, 290, 3));
// console.log(Math.min(5, 19, 290, 3));

// //Math pi is pigreco
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6));

// //Get random numbers based on range
// const randomInt = (min, max) =>
//   //First we set dinamically min and max and then we add the minimum value .
//   Math.floor(Math.random() * (max - min + 1)) + min;

// console.log(randomInt(10, 20));
// console.log(randomInt(0, 3));

// //Rounding integers
// console.log(Math.trunc(2.3));

// //Arrotonda all integer
// console.log(Math.round(2.3));
// console.log(Math.round(2.3));

// //Ceil round up to the next number
// console.log(Math.ceil(2.3));

// //Floor round up to the previous number
// console.log(Math.floor(2.3));

// console.log(Math.trunc(-2.3));
// console.log(Math.floor(-2.3)); //Works better with negative numbers

// //To fix always return a string . The 0 is the amount of decimal part that we want
// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log((2.7556).toFixed(2));

// //Reminder operator : return the remainder of a division
// console.log(5 % 2); // 5 = 2 +2 +1
// console.log(6 % 2);

// //Check if pari o dispari ( even or odd)
// const isEvenOrOdd = num => num % 2 === 0;
// console.log(isEvenOrOdd(3));

// console.log(5 % 2);
// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
//     //I can tell based on the index when to apply the style
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// //287,460,000,000 We can put underscores to make the number clear
// const diameter = 287_460_000_000;
// //Engine ingnores the underscores
// console.log(diameter);

// //Only put the underscore between two numbers!!
// const priceCents = 345_99;

// console.log(Number('239_00')); //I can't do this
// console.log(parseInt('239_00')); //this ok

// //Larger safe number
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// //beyond the larger safe num the result are unpredictable and not always correct
// console.log(2 ** 53 + 1);

// //Es 2020 : BigINT , two ways of creating it
// console.log(22378623894328742323423423489n);
// console.log(BigInt(22378623894328742323423423489)); //BETTER FOR SMALLER NUMBERS
// //These two are not equal because first js needs to interpretate the number and then appling the function bigint

// //Math operations doesent work
// // console.log(Math.sqrt(BigInt(482347823947382723987483289432)));
// //Operations
// console.log(10000n + 10000n);

// const huge = 23823874238972834789237428n;
// const num = 23;
// console.log(huge * BigInt(num)); //Can't convert big ints to number , we need to convert it

// //Exceptions
// console.log(20n > 15);
// console.log(20n === 20); //False
// console.log(typeof 20n);
// console.log(20n == 20); //True
// console.log(20n == '20'); //True

// console.log(huge + ' is really big');

// //DIvisions
// console.log(11n / 3n); //With divisions it cut off decimal part

// //Dates and Times
// //Create a date

// //1)
// // const now = new Date();
// // console.log(now);

// // //2) Parse a string
// // console.log(new Date('Mon Apr 27 2026 12:33:19'));
// // console.log(new Date('December 24 , 2015'));

// // console.log(new Date(account1.movementsDates[0]));
// // console.log(new Date(2037, 10 + 1, 19, 15, 23, 5));

// // //3 giorni dopo , 24 ore , 60 min , 60s in millisecondi
// // console.log(new Date(3 * 24 * 60 * 60 * 1000));

// //Working with dates
// const future = new Date(2037, 10 + 1, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// //Convert a date and save him into a string
// console.log(future.toISOString());

// console.log(future.getTime());
// console.log(new Date(2144845380000));

// console.log(Date.now());

// //Sets
// future.setFullYear(2040);
// console.log(future);

//Operations with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);

const daysPAssed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

const days1 = daysPAssed(new Date(2037, 3, 14), new Date(2037, 3, 24));

//Now we need to convert the number
console.log(days1);

const options = {
  style: 'currency',
  // unit: 'kilometer-per-second ',
  currency: 'EUR',
  useGrouping: false, //With this we get rid of separators
};
//Internationalizating numbers
const num = 3884764.23;

console.log(new Intl.NumberFormat('it-IT', options).format(num));

//#region SET TIMEOUT//////////////////
//When the timer ends the execution start working but it don't stop!!
setTimeout(
  (ing1, ing2) => console.log(`here is your pizza with ${ing1} and ${ing2}`),
  5000,
  //We can pass arguments after the timer set
  'olives',
  'spinach',
);

console.log('Waiting');

//I can clear the timer before it ends using a condition
const ingredients = ['olives ', 'broccoli'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`here is your pizza with ${ing1}and ${ing2}`),
  5000,
  //We can pass arguments after the timer set
  ...ingredients,
);

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);
//#endregion SET TIMEOUT//////////////////

//#region SET INTERVAL
//We can call the function multiple times on a timer
// setInterval(function () {
//   const options = {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//   };
//   const now = new Intl.DateTimeFormat('it-IT', options).format(new Date());

//   console.log(now);
// }, 1000);
//#endregion SET INTERVAL
