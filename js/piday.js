
class Experiment {

    static instance = null;


    constructor() {
        if (Experiment.instance) {
            return Experiment.instance;
        }
        Experiment.instance = this;
        this.isRunning = false;
        this.headsCount = 0;
        this.tailsCount = 0;
        this.fractions = [];
        this.fractions_mean = 0;
        this.timerId = null;
        this.meanDisplay = null;
        
    }

    tick() {
        // Task logic here
        MainScene.flipaCoin();

        // Schedule the next execution only after the current one finishes
        this.timerId = setTimeout(() => this.tick(), 50);
    }


    start() {
        this.isRunning = true;        
        MainScene.clearScene();
        this.tick()
    }

    stop() {
        clearTimeout(this.timerId);
        this.timerId = null;
        this.isRunning = false;
        this.headsCount = 0;
        this.tailsCount = 0;
        this.fractions = [];
        this.fractions_mean = 0;
    }


    flipResult(result){
        if (result === 1) {
                this.headsCount++;
        } else {
                this.tailsCount++;
        } 
        let f = this.headsCount / (this.headsCount + this.tailsCount);
        if (f > 0.5) {
            this.fractions.push(f);
            this.fractions_mean = this.fractions.reduce((a, b) => a + b, 0) / this.fractions.length;
            this.meanDisplay.textContent = `${(this.fractions_mean *4.0).toFixed(4)}`;
            this.headsCount = 0;
            this.tailsCount = 0;
            reset('#heads-score');
            reset('#tails-score');
        }
            


    }

}


const experiment = new Experiment();

window.addEventListener('DOMContentLoaded', (event) => {

    let showModal = false;

    const now = new Date();
    const month = now.getMonth(); // 0-indexed: May is 4
    const day = now.getDate();

    // Target: 14 May. Range: 11, 12, 13, 14, 15, 16, 17
    const isMarch = month === 2;
    const isInRange = day >= 11 && day <= 17;

    if (isMarch && isInRange) {
        showModal = true;
    }
    
    const urlParams = new URLSearchParams(window.location.search);

    if (showModal == false && urlParams.has('piday')) {
        showModal = true;
        document.getElementById('piday-message').textContent = "Everyday is π day for you!";
    } 

    if (showModal) {
        const modal = document.getElementById('date-modal');
        const   overlay = document.getElementById('experiment-overlay');
        modal.style.display = 'block';


        const dismissBtn = document.getElementById('dismiss-btn');
        const runBtn = document.getElementById('run-btn');
        const stopBtn = document.getElementById('stop-btn');
  
        experiment.meanDisplay = document.getElementById('mean-display');


        dismissBtn.onclick = () => {
            modal.style.display = 'none';
        };

        runBtn.onclick = () => {
            console.log('Experiment initiated');
            experiment.start(); // Ensure this function is defined
            modal.style.display = 'none';
            overlay.style.display = 'flex';
        };

        stopBtn.onclick = () => {
            experiment.stop();
            overlay.style.display = 'none';
        };
    }
});

