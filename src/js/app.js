const jsSHA = require('jssha')

const vm = new Vue({
    el: '#app',
    data: {
        number: 50, // bet number
        betAmount: null, // bet amount
        balance: null, //player`s current balance
        random: Math.round(Math.random() * 99) + 1, //next random number
        numbersForAnimate: Array.from({length: 49}, () => Math.floor(Math.random() * 99 + 1)), // set of random number for animate process
        inProcess: false, // true if player pressed BetLo or BetHi button and waits for result
        win: null, // win or loose on last bet,
        justOpen: true, // webpage is just opened and there were not bets yet
    },
    computed: {
        hash() { // create hash from random
            let shaObj = new jsSHA("SHA-256", "TEXT")
            shaObj.update(this.random.toString())
            return shaObj.getHash("HEX")
        },
        validateBetAmount() {
            return /^[0-9]{1,3}(\.\d{1})?$/.test(this.betAmount) && this.betAmount > 0 && this.betAmount <= this.balance
        },
        validateNumber() {
            return /^[0-9]{1,3}$/.test(this.number) && this.number > 0 && this.number <= 100
        },
        isDisabled() {
            return !this.validateBetAmount || !this.validateNumber || this.inProcess
        },
        betHiChance() {
            return this.validateNumber ? (100 - this.number) + '%' : ''
        },
        betHiPayout() {
            return this.betHiChance ? parseFloat(Number(100 / (100 - this.number)).toFixed(2)) : ''
        },
        betLoChance() {
            return this.validateNumber ? this.number + '%' : ''
        },
        betLoPayout() {
            return this.betLoChance ? parseFloat(Number(100 / this.number).toFixed(2)) : ''
        },
        errorText() { // display error text
            if (!this.validateNumber) {
                return 'please input integer from 1 to 100'
            }
            if (!this.validateBetAmount) {
                return this.betAmount > this.balance ? 'Bet amount can`t be more than your balance' :
                    'Bet amount must be float number more than 0'
            }
            return '&nbsp;'
        }
    },
    mounted() { // get saved player`s balance
        this.balance = localStorage.getItem('balance') ? Number(localStorage.getItem('balance')) : 0
        localStorage.setItem('balance', this.balance)
        this.betAmount = this.balance > 10 ? '10.0' : this.balance ? this.balance : '5.0'
        this.numbersForAnimate.unshift('&nbsp;')
    },
    methods: {
        getFreeCredits() {
            this.balance += 100
            localStorage.setItem('balance', this.balance)
        },
        makeBet(direction) {
            if (this.inProcess) return
            this.inProcess = true
            this.justOpen = false
            this.win = null
            let el = $('.win-animate')
            let height = $(el).height() * (49 / 50) * -1
            Vue.set(this.numbersForAnimate, 49, this.random)
            $(el).animate({top: height}, 1000, () => {
                Vue.set(this.numbersForAnimate, 0, this.random)
                $(el).css('top', 0)
                this.inProcess = false
                let summ = null
                if (direction == 'Hi') {
                    summ = this.random >= this.number ? this.betAmount * (this.betHiPayout - 1) : null
                } else {
                    summ = this.random <= this.number ? this.betAmount * (this.betLoPayout - 1) : null
                }
                this.win = summ ? true : false
                this.balance += summ ? summ : this.betAmount * -1
                localStorage.setItem('balance', this.balance)
                this.random = Math.round(Math.random() * 99) + 1
            })
        }
    }
})
