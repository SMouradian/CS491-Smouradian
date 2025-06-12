// REGISTER CSS CODE FOR OUTPUT AND INPUT GENERATION
const output = document.getElementById('output');
const numbers = document.querySelectorAll('.digit');
const alphabetButton = document.querySelector('.alphabet');
const clearButton = document.querySelector('.clear-digit');
const callButton = document.querySelector('.call-button');

// CREATE FLAGS FOR ALGORITHM TO USE DURING USER INPUT
let letterMode = false;
let lastDigit = null;
let pressCount = 0;
let letterTimeout;


// LETTER VALUES FOR EACH DIGIT
const digitMap = {
    '2': ['A', 'B', 'C'],
	'3': ['D', 'E', 'F'],
    '4': ['G', 'H', 'I'],
    '5': ['J', 'K', 'L'],
    '6': ['M', 'N', 'O'],
    '7': ['P', 'Q', 'R', 'S'],
    '8': ['T', 'U', 'V'],
    '9': ['W', 'X', 'Y', 'Z']
};

// TOGGLE ALPHABET MODE
alphabetButton.addEventListener('click', () => {
  letterMode = !letterMode;
  alphabetButton.style.backgroundColor = letterMode ? 'aqua' : 'blue';
  alphabetButton.style.color = letterMode ? 'black' : 'white';
});

// COUNT THE NUMBER OF CLICKS FOR EACH DIGIT
numbers.forEach(digit => {
  digit.addEventListener('click', () => {
    const value = digit.firstChild.textContent.trim();

    // NUMBER MODE
    if(!letterMode || !digitMap[value]){
      output.textContent += value;
      resetCycle();
      return;
    }

    // ALPHABET MODE
    if(value === lastDigit){
      pressCount = (pressCount + 1) % digitMap[value].length;
      
      // REMOVE LAST LETTER WHEN SAME DIGIT IS PUSHED
      if(output.textContent.length > 0){
      	output.textContent = output.textContent.slice(0, -1);
    	}
    }
    else{
      lastDigit = value;
      pressCount = 0;
    }
    
    // ADD A NEW LETTER
    output.textContent += digitMap[value][pressCount];

    // SET/RESET INPUT TIMEOUT
    clearTimeout(letterTimeout);
    letterTimeout = setTimeout(() => {
    	resetCycle();
    }, 1000);
  });
});


// CLEAR OUTPUT
clearButton.addEventListener('click', () => {
  output.textContent = '';
  resetCycle();
});

callButton.addEventListener('click', () => {
  output.textContent = '';
  console.log("Calling contact...");
  resetCycle();
});

function resetCycle(){
  lastDigit = null;
  pressCount = 0;
  clearTimeout(letterTimeout);
}