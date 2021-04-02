import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardData } from './card-data.model';
import { RestartDialogComponent } from './restart-dialog/restart-dialog.component';
import { interval } from 'rxjs';
import { startWith, take } from 'rxjs/operators';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  gameState = false;

  saludo = 0;

  saludos = [
  'baloon-ingles.png',
  'baloon-alemao.png',
  'baloon-espanhol.png',
  'baloon-italiano.png',
  'baloon-frances.png'
  ];

  cardImages = [
    'ingles.jpg',
    'espanhol.jpg',
    'frances.jpg',
    'italiano.jpg',
    'alemao.jpg'
  ];

  shouldShake = false;
  cards: CardData[] = [];

  flippedCards: CardData[] = [];

  matchedCount = 0;
  audio = new Audio();


  shuffleArray(anArray: any[]): any[] {
    return anArray.map(a => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map(a => a[1]);
  }

  constructor(private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.setupCards();
    
    interval(2000).pipe(startWith(0)).subscribe(() => {
      this.changeSaludo();
    });

    this.showWelcomeDialog();
  }

  playAudio(){
    this.audio.src = "../../../assets/mario_song.mp3";
    this.audio.load();
    this.audio.play();
  }

  public get baloon() {
    return this.saludos[this.saludo];
}

  changeSaludo(){
    if(this.saludo<4){
      this.saludo++;
    } else {
      this.saludo = 0;
    }
  }

  setupCards(): void {
    this.cards = [];
    this.cardImages.forEach((image) => {
      const cardData: CardData = {
        imageId: image,
        state: 'default'
      };

      this.cards.push({ ...cardData });
      this.cards.push({ ...cardData });

    });

    this.cards = this.shuffleArray(this.cards);
  }

  cardClicked(index: number): void {
    const cardInfo = this.cards[index];

    if (cardInfo.state === 'default' && this.flippedCards.length < 2) {
      cardInfo.state = 'flipped';
      this.flippedCards.push(cardInfo);

      if (this.flippedCards.length > 1) {
        this.checkForCardMatch();
      }

    } else if (cardInfo.state === 'flipped') {
      cardInfo.state = 'default';
      this.flippedCards.pop();

    }
  }

  checkForCardMatch(): void {
    setTimeout(() => {
      const cardOne = this.flippedCards[0];
      const cardTwo = this.flippedCards[1];
      const nextState = cardOne.imageId === cardTwo.imageId ? 'matched' : 'default';
      cardOne.state = cardTwo.state = nextState;

      this.flippedCards = [];

      if (nextState === 'matched') {
        this.matchedCount++;

        if (this.matchedCount === this.cardImages.length) {
          this.showVictoryDialog();
        }
      } else {
        this.playWrongMovement();
        this.shouldShake = true;

        setTimeout(() => {
          this.shouldShake = false;
        },300);

      }

    }, 1000);
  }

  restart(): void {
    this.gameState = true;
    this.matchedCount = 0;
    this.setupCards();
    this.audio.pause();
    this.audio.play();
  }


  showWelcomeDialog(){
    const dialogRef = this.dialog.open(WelcomeDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      this.restart();
      this.playAudio();
    });
  }

  showVictoryDialog(){
    const dialogRef = this.dialog.open(RestartDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      this.restart();
      this.playAudio();
    });
  }

  playWrongMovement(){
    let audio = new Audio();
    audio.src = "../../../assets/wrong.mp3";
    audio.load();
    audio.play();
  }
}
