const title = document.querySelector('.title');
const phrase = "I Have Something For You";
const words = phrase.split(' ');

title.innerHTML = '';

words.forEach((word) => {
  const wordSpan = document.createElement('span');
  wordSpan.className = 'word';

  for (let i = 0; i < word.length; i++) {
    const charSpan = document.createElement('span');
    charSpan.textContent = word[i];
    const randomDelay = Math.random() * 2.5;
    charSpan.style.animationDelay = `${randomDelay}s`;
    wordSpan.appendChild(charSpan);
  }

  title.appendChild(wordSpan);
});
