const Emitter = require('../classes/util/Emitter')

const EconomyError = require('../classes/util/EconomyError')

const FetchManager = require('./FetchManager')
const DatabaseManager = require('./DatabaseManager')

const CurrencyManager = require('./CurrencyManager')
const Currency = require('../classes/Currency')

const errors = require('../structures/errors')


/**
* Balance manager methods class.
* @extends {Emitter}
*/
class BalanceManager extends Emitter {

    /**
     * Balance Manager.
     *
     * @param {object} options Economy configuration.
     * @param {string} options.storagePath Full path to a JSON file. Default: './storage.json'.
     */
    constructor(options = {}) {
        super(options)


        /**
         * Economy configuration.
         * @type {EconomyConfiguration}
         * @private
         */
        this.options = options

        /**
         * Fetch manager.
         * @type {FetchManager}
         * @private
         */
        this.fetcher = new FetchManager(options)

        /**
         * Database manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = new DatabaseManager(options)

        /**
         * Currency Manager.
         * @type {CurrencyManager}
         * @private
         */
        this._currencies = new CurrencyManager(options, this.database)
    }

    /**
     * Returns a factory with `get`, `set`, `add` and `subtract` methods to work with custom currencies.
     * @param {string | number} currencyID Currency ID, its name or its symbol.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @returns {CurrencyFactory} Factory object.
     */
    currency(currencyID, memberID, guildID) {
        const currencies = this._currencies
        const database = this.database

        const options = this.options

        return {
            get() {
                return currencies.getBalance(currencyID, memberID, guildID)
            },

            getCurrency() {
                const currency = currencies.get(currencyID, guildID)
                return new Currency(currency.id, guildID, options, currency, database)
            },

            set(amount, reason) {
                return currencies.setBalance(currencyID, amount, memberID, guildID, reason)
            },

            add(amount, reason) {
                return currencies.addBalance(currencyID, amount, memberID, guildID, reason)
            },

            subtract(amount, reason) {
                return currencies.subtractBalance(currencyID, amount, memberID, guildID, reason)
            }
        }
    }

    /**
    * Fetches the user's balance.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @returns {number} User's balance
    */
    fetch(memberID, guildID) {
        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        return this.fetcher.fetchBalance(memberID, guildID)
    }

    /**
    * Gets the user's balance.
    *
    * This method is an alias of `BalanceManager.fetch()` method.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @returns {number} User's balance
    */
    get(memberID, guildID) {
        return this.fetch(memberID, guildID)
    }

    /**
     * Sets the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} [reason] The reason why you set the money.
     * @returns {number} Money amount.
     */
    set(amount, memberID, guildID, reason = null) {
        const balance = this.fetcher.fetchBalance(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount, 'INVALID_TYPE')
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        this.database.set(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceSet', {
            type: 'set',
            guildID,
            memberID,
            amount: Number(amount),
            balance,
            reason
        })

        return amount
    }

    /**
     * Adds the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} [reason] The reason why you add the money.
     * @returns {number} Money amount.
     */
    add(amount, memberID, guildID, reason = null) {
        const balance = this.fetcher.fetchBalance(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount, 'INVALID_TYPE')
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        this.database.add(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceAdd', {
            type: 'add',
            guildID,
            memberID,
            amount: Number(amount),
            balance: balance + amount,
            reason
        })

        return amount
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} [reason] The reason why you subreact the money.
     * @returns {number} Money amount.
     */
    subtract(amount, memberID, guildID, reason = null) {
        const balance = this.fetcher.fetchBalance(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount, 'INVALID_TYPE')
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        this.database.subtract(`${guildID}.${memberID}.money`, amount)

        this.emit('balanceSubtract', {
            type: 'subtract',
            guildID,
            memberID,
            amount: Number(amount),
            balance: balance - amount,
            reason
        })

        return amount
    }

    /**
     * Deposits the specified amount of money.
     * @param {number} amount Money amount.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {string} [reason] The reason of the operation.
     * @returns {number} Money amount.
     */
    deposit(amount, memberID, guildID, reason = null) {
        const balance = this.fetcher.fetchBalance(memberID, guildID)
        const bank = this.fetcher.fetchBank(memberID, guildID)

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount, 'INVALID_TYPE')
        }

        if (amount < 0) {
            throw new EconomyError(errors.invalidTypes.depositInvalidInput, 'INVALID_INPUT')
        }

        if (typeof memberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.memberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        this.database.subtract(`${guildID}.${memberID}.money`, amount)
        this.database.add(`${guildID}.${memberID}.bank`, amount)

        this.emit('balanceSubtract', {
            type: 'subtract',
            guildID,
            memberID,
            amount: Number(amount),
            balance: balance - amount,
            reason
        })

        this.emit('bankAdd', {
            type: 'add',
            guildID,
            memberID,
            amount: Number(amount),
            balance: bank + amount,
            reason
        })

        return amount
    }

    /**
     * Gets a balance leaderboard for specified guild.
     * @param {string} guildID Guild ID.
     * @returns {BalanceLeaderboard[]} Sorted leaderboard array.
     */
    leaderboard(guildID) {
        const lb = []
        const data = this.fetcher.fetchAll()

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        const guildData = data[guildID]
        if (!guildData) return []

        const users = Object.keys(guildData)
        const ranks = Object.values(guildData).map(user => user.money).filter(userID => !isNaN(userID))

        for (const rank in ranks) lb.push({
            userID: users[rank],
            money: Number(ranks[rank])
        })

        return lb
            .sort((previous, current) => current.money - previous.money)
            .filter(entry => entry.userID !== 'shop')
    }

    /**
     * Transfers the money to a specified user.
     * @param {string} guildID Guild ID.
     * @param {TransferingOptions} options Transfering options.
     * @returns {TransferingResult} Transfering result object.
     */
    transfer(guildID, options) {
        const {
            amount, senderMemberID,
            receiverMemberID,
            sendingReason, receivingReason
        } = options || {}

        if (typeof guildID !== 'string') {
            throw new EconomyError(errors.invalidTypes.guildID + typeof guildID, 'INVALID_TYPE')
        }

        if (isNaN(amount)) {
            throw new EconomyError(errors.invalidTypes.amount + typeof amount, 'INVALID_TYPE')
        }

        if (typeof senderMemberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.senderMemberID + typeof memberID, 'INVALID_TYPE')
        }

        if (typeof receiverMemberID !== 'string') {
            throw new EconomyError(errors.invalidTypes.receiverMemberID + typeof memberID, 'INVALID_TYPE')
        }

        this.add(amount, receiverMemberID, guildID, receivingReason || 'receiving money from user')
        this.subtract(amount, senderMemberID, guildID, sendingReason || 'sending money to user')

        return {
            success: true,
            guildID,

            senderBalance: this.fetch(senderMemberID, guildID),
            receiverBalance: this.fetch(receiverMemberID, guildID),

            amount,

            senderMemberID,
            receiverMemberID,

            sendingReason,
            receivingReason,
        }
    }
}


/**
 * @typedef {Object} TransferingResult
 * @property {boolean} success Whether the transfer was successful or not.
 * @property {string} guildID Guild ID.
 * @property {number} amount Amount of money that was sent.
 * @property {string} senderMemberID Sender member ID.
 * @property {string} receiverMemberID Receiver member ID.
 * @property {string} sendingReason Sending reason.
 * @property {string} receivingReason Receiving reason.
 * @property {number} senderBalance New sender balance.
 * @property {number} receiverBalance New receiver balance.
 */

/**
 * @typedef {object} CurrencyFactory
 * @property {FactoryGet} get Gets the currency balance.
 * @property {FactoryGetCurrency} getCurrency Gets the currency object.
 * @property {FactorySet} set Sets the currency balance.
 * @property {FactoryAdd} add Adds the money on the currency balance.
 * @property {FactorySubtract} subtract Subtracts the money from the currency balance.
 */

/**
 * @callback FactoryGet
 * @returns {number} Currency balance.
 */

/**
 * @callback FactoryGetCurrency
 * @returns {Currency} Currency data object.
 */

/**
 * @callback FactorySet
 * @param {number} amount Amount of money to set.
 * @param {string} [reason] The reason why the money was set.
 * @returns {number} Updated currency balance.
 */

/**
 * @callback FactoryAdd
 * @param {number} amount Amount of money to add.
 * @param {string} [reason] The reason why the money was added.
 * @returns {number} Updated currency balance.
 */

/**
 * @callback FactorySubtract
 * @param {number} amount Amount of money to subtract.
 * @param {string} [reason] The reason why the money was subtracted.
 * @returns {number} Updated currency balance.
 */

/**
 * Transfering options.
 * @typedef {object} TransferingOptions
 * @property {number} amount Amount of money to send.
 * @property {string} senderMemberID A member ID who will send the money.
 * @property {string} receiverMemberID A member ID who will receive the money.
 * @property {string} [sendingReason='sending money to user']
 * The reason of subtracting the money from sender. (example: "sending money to {user}")
 * @property {string} [receivingReason='receiving money from user']
 * The reason of adding a money to receiver. (example: "receiving money from {user}")
 */

/**
 * Balance leaderboard object.
 * @typedef {object} BalanceLeaderboard
 * @property {number} index User's place in the leaderboard.
 * @property {string} userID User ID.
 * @property {number} money Amount of money.
 */


/**
 * Balance manager class.
 * @type {BalanceManager}
 */
module.exports = BalanceManager
