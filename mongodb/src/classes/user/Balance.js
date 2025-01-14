
const BalanceManager = require('../../managers/BalanceManager')

const CurrencyManager = require('../../managers/CurrencyManager')
const Currency = require('../Currency')

/**
 * User balance class.
 */
class Balance {

    /**
     * User balance class.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {EconomyConfiguration} ecoOptions Economy configuration.
     * @param {DatabaseManager} database Database manager.
     * @param {CacheManager} cache Cache Manager.
     */
    constructor(memberID, guildID, ecoOptions, database, cache) {

        /**
        * Member ID.
        * @type {string}
        */
        this.memberID = memberID

        /**
         * Guild ID.
         * @type {string}
         */
        this.guildID = guildID

        /**
         * Economy configuration.
         * @type {EconomyConfiguration}
         * @private
         */
        this.options = ecoOptions

        /**
         * Database Manager.
         * @type {DatabaseManager}
         * @private
         */
        this.database = database

        /**
         * Cache Manager.
         * @type {CacheManager}
         * @private
         */
        this.cache = cache

        /**
         * Balance Manager.
         * @type {BalanceManager}
         * @private
         */
        this._balance = new BalanceManager(ecoOptions, database, cache)

        /**
         * Currency Manager.
         * @type {CurrencyManager}
         * @private
         */
        this._currencies = new CurrencyManager(ecoOptions, database, cache)
    }

    /**
     * Returns a factory with `get`, `set`, `add` and `subtract` methods to work with custom currencies.
     * @param {string | number} currencyID Currency ID, its name or its symbol.
     * @returns {CurrencyFactory} Factory object.
     */
    currency(currencyID) {
        const currencies = this._currencies

        const database = this.database
        const cache = this.cache

        const options = this.options

        const memberID = this.memberID
        const guildID = this.guildID

        return {
            get() {
                return currencies.getBalance(currencyID, memberID, guildID)
            },

            async getCurrency() {
                const currency = await currencies.get(currencyID, guildID)
                return new Currency(currency.id, guildID, options, currency, database, cache)
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
     * Sets the money amount on user's balance.
     * @param {number} amount Money amount
     * @param {string} [reason] The reason why you set the money.
     * @returns {Promise<number>} Money amount
     */
    set(amount, reason) {
        return this._balance.set(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Adds the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} [reason] The reason why you add the money.
     * @returns {Promise<number>} Money amount.
     */
    add(amount, reason) {
        return this._balance.add(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Subtracts the money amount on user's balance.
     * @param {number} amount Money amount.
     * @param {string} [reason] The reason why you subtract the money.
     * @returns {Promise<number>} Money amount.
     */
    subtract(amount, reason) {
        return this._balance.subtract(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Fetches the user's balance.
     * @returns {Promise<number>} User's balance.
     */
    get() {
        return this._balance.get(this.memberID, this.guildID)
    }

    /**
     * Deposits the specified amount of money.
     * @param {number} amount Money amount.
     * @param {string} [reason] The reason of the operation.
     * @returns {Promise<number>} Money amount.
     */
    deposit(amount, reason = null) {
        return this._balance.deposit(amount, this.memberID, this.guildID, reason)
    }

    /**
     * Fetches the user's balance.
     * 
     * This method is an alias for 'Balance.get()' method
     * @returns {Promise<number>} User's balance.
     */
    fetch() {
        return this.get()
    }

    /**
     * Transfers the money to a specified user.
     * @param {UserTransferingOptions} options Transfering options.
     * @returns {Promise<TransferingResult>} Transfering result object.
     */
    async transfer(options) {
        const transferingOptions = {
            ...options,
            receiverMemberID: this.memberID
        }

        const result = await this._balance.transfer(this.guildID, transferingOptions)
        return result
    }
}


/**
 * @typedef {Object} TransferingResult
 * @property {boolean} success Whether the transfer was successful or not.
 * @property {string} guildID Guild ID.
 * @property {number} amount Amount of money that was sent.
 * @property {string} senderMemberID Sender member ID.
 * @property {string} sendingReason Sending reason.
 * @property {string} receivingReason Receiving reason.
 * @property {number} senderBalance New sender balance.
 * @property {number} receiverBalance New receiver balance.
 */

/**
 * @typedef {object} EconomyConfiguration Default Economy configuration.
 * @property {string} [storagePath='./storage.json'] Full path to a JSON file. Default: './storage.json'
 * @property {boolean} [checkStorage=true] Checks the if database file exists and if it has errors. Default: true
 * @property {number} [dailyCooldown=86400000] 
 * Cooldown for Daily Command (in ms). Default: 24 hours (60000 * 60 * 24 ms)
 * 
 * @property {number} [workCooldown=3600000] Cooldown for Work Command (in ms). Default: 1 hour (60000 * 60 ms)
 * @property {number | number[]} [dailyAmount=100] Amount of money for Daily Command. Default: 100.
 * @property {number} [weeklyCooldown=604800000] 
 * Cooldown for Weekly Command (in ms). Default: 7 days (60000 * 60 * 24 * 7 ms)
 * 
 * @property {number | number[]} [weeklyAmount=100] Amount of money for Weekly Command. Default: 1000.
 * @property {number | number[]} [workAmount=[10, 50]] Amount of money for Work Command. Default: [10, 50].
 * @property {boolean} [subtractOnBuy=true] 
 * If true, when someone buys the item, their balance will subtract by item price. Default: false
 * 
 * @property {number} [sellingItemPercent=75] 
 * Percent of the item's price it will be sold for. Default: 75.
 * 
 * @property {boolean} [deprecationWarnings=true] 
 * If true, the deprecation warnings will be sent in the console. Default: true.
 * 
 * @property {boolean} [savePurchasesHistory=true] If true, the module will save all the purchases history.
 * 
 * @property {number} [updateCountdown=1000] Checks for if storage file exists in specified time (in ms). Default: 1000.
 * @property {string} [dateLocale='en'] The region (example: 'ru'; 'en') to format the date and time. Default: 'en'.
 * @property {UpdaterOptions} [updater=UpdaterOptions] Update checker configuration.
 * @property {ErrorHandlerConfiguration} [errorHandler=ErrorHandlerConfiguration] Error handler configuration.

 * @property {CheckerConfiguration} [optionsChecker=CheckerConfiguration] 
 * Configuration for an 'Economy.utils.checkConfiguration' method.
 * @property {boolean} [debug=false] Enables or disables the debug mode.
 */

/**
 * Transfering options.
 * @typedef {object} UserTransferingOptions
 * @property {number} amount Amount of money to send.
 * @property {string} senderMemberID A member ID who will send the money.
 * @property {string} [sendingReason='sending money to user'] 
 * The reason of subtracting the money from sender. (example: "sending money to {user}")
 * @property {string} [receivingReason='receiving money from user']
 * The reason of adding a money to receiver. (example: "receiving money from {user}")
 */

/**
 * @typedef {Object} CurrencyObject
 * @property {number} id Currency ID.
 * @property {string} guildID Guild ID.
 * @property {string} name Currency name.
 * @property {string} [symbol] Currency symbol.
 * @property {object} balances Currency balances object.
 * @property {object} custom Custom currency data object.
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
 * @returns {Promise<number>} Currency balance.
 */

/**
 * @callback FactoryGetCurrency
 * @returns {Promise<Currency>} Currency data object.
 */

/**
 * @callback FactorySet
 * @param {number} amount Amount of money to set.
 * @param {string} [reason] The reason why the money was set.
 * @returns {Promise<number>} Updated currency balance.
 */

/**
 * @callback FactoryAdd
 * @param {number} amount Amount of money to add.
 * @param {string} [reason] The reason why the money was added.
 * @returns {Promise<number>} Updated currency balance.
 */

/**
 * @callback FactorySubtract
 * @param {number} amount Amount of money to subtract.
 * @param {string} [reason] The reason why the money was subtracted.
 * @returns {Promise<number>} Updated currency balance.
 */

/**
 * User balance class.
 * @type {Balance}
 */
module.exports = Balance
