const defaultCurrencyObject = require('../structures/DefaultCurrencyObject')

const EconomyError = require('./util/EconomyError')
const errors = require('../structures/errors')

const Emitter = require('./util/Emitter')

/**
 * Currency class.
 * @extends {Emitter}
 */
class Currency extends Emitter {

	/**
	 * @param {number} currencyID Currency ID.
	 * @param {string} guildID Guild ID.
	 * @param {EconomyConfiguration} ecoOptions Economy configuration object.
	 * @param {CurrencyObject} currencyObject Currency object.
	 * @param {DatabaseManager} database Database manager.
	 */
	constructor(currencyID, guildID, ecoOptions, currencyObject, database) {
		super()

		/**
		 * Economy configuration.
		 * @type {EconomyConfiguration}
		 * @private
		 */
		this.options = ecoOptions

		/**
		 * Database manager.
		 * @type {DatabaseManager}
		 * @private
		 */
		this.database = database

		/**
		 * Raw currency object.
		 * @type {CurrencyObject}
		 */
		this.rawObject = currencyObject

		/**
		 * Guild ID.
		 * @type {string}
		 */
		this.guildID = guildID

		/**
		 * Currency ID.
		 * @type {number}
		 */
		this.id = currencyID

		/**
		 * Currency name.
		 * @type {string}
		 */
		this.name = currencyObject.name

		/**
		 * Currency symbol.
		 * @type {?string}
		 */
		this.symbol = currencyObject.symbol

		/**
		 * Currency balances object.
		 * @type {object}
		 */
		this.balances = currencyObject.balances || {}

		/**
		 * Custom currency data object.
		 * @type {object}
		 */
		this.custom = currencyObject.custom || {}

		for (const [key, value] of Object.entries(currencyObject || {})) {
			this[key] = value
		}
	}

	/**
	 * Creates a currency object in guild database.
	 * @returns {Currency} Currency object.
	 */
	create() {
		const currenciesArray = this._all(this.guildID)
		const newCurrencyObject = defaultCurrencyObject

		newCurrencyObject.id = currenciesArray.length ? currenciesArray[currenciesArray.length - 1].id + 1 : 1
		newCurrencyObject.name = this.name
		newCurrencyObject.symbol = this.symbol

		currenciesArray.push(newCurrencyObject)

		this.database.set(`${this.guildID}.currencies`, currenciesArray)
		return this
	}

	/**
	 * Gets the array of available currencies.
	 * @param {string} guildID Guild ID.
	 * @returns {CurrencyObject[]} Currencies array.
	 * @private
	 */
	_all() {
		const currenciesArray = this.database.fetch(`${this.guildID}.currencies`)
		return currenciesArray || []
	}

	/**
	 * Deletes the currency object from guild database.
	 * @returns {Currency} Deleted currency object.
	 */
	delete() {
		const currenciesArray = this._all(this.guildID)
		const currencyIndex = currenciesArray.findIndex(currency => currency.id == this.id)

		if (currencyIndex == -1) return false

		currenciesArray.splice(currencyIndex, 1)
		this.database.set(`${this.guildID}.currencies`, currenciesArray)

		return this
	}


	/**
	 * Edits the currency object.
	 * @param {'name' | 'symbol' | 'custom'} property Currency property to edit.
	 * @param {any} value Any value to set.
	 * @returns {Currency} Edited currency object.
	 */
	edit(property, value) {
		const currenciesArray = this._all(this.guildID)

		const [currency, currencyIndex] = [
			currenciesArray.find(currency => currency.id == this.id),
			currenciesArray.findIndex(currency => currency.id == this.id)
		]

		if (!['name', 'symbol', 'custom'].includes(property)) {
			throw new EconomyError(errors.invalidProperty('Currency', property), 'INVALID_PROPERTY')
		}

		if (!currency) {
			throw new EconomyError(errors.currencies.notFound(this.id, this.guildID), 'CURRENCY_NOT_FOUND')
		}

		currency[property] = value

		delete currency.database
		delete currency.options
		delete currency.rawObject

		currenciesArray.splice(currencyIndex, 1, currency)
		this.database.set(`${this.guildID}.currencies`, currenciesArray)

		this[property] = value
		return this
	}

	/**
	 * Edits the currency's custom data object.
	 * @param {object} customObject Custom data object to set.
	 * @returns {Currency} Currency object with its updated custom property.
	 */
	setCustom(customObject) {
		const newCurrencyObject = this.edit('custom', customObject)
		return newCurrencyObject
	}

	/**
	 * Sets the currency for specified member.
	 * @param {string} memberID Member ID.
	 * @returns {number} Member's balance.
	 */
	getBalance(memberID) {
		const currencyBalance = this.balances[memberID]
		return currencyBalance || 0
	}

	/**
	 * Sets the currency for specified member.
	 * @param {number} amount Amount of money to set.
	 * @param {string} memberID Member ID.
	 * @param {string} [reason] The reason why the balance was set.
	 * @param {boolean} [emitSet=true] If true, `customCurrencySet` event will be emitted on set. Default: true.
	 * @returns {number} Amount of money that was set.
	 */
	setBalance(amount, memberID, reason = '', emitSet = true) {
		const currenciesArray = this._all(this.guildID)

		const [currency, currencyIndex] = [
			currenciesArray.find(currency => currency.id == this.id),
			currenciesArray.findIndex(currency => currency.id == this.id)
		]

		if (isNaN(amount)) {
			throw new EconomyError(errors.invalidType('amount', 'string', memberID), 'INVALID_TYPE')
		}

		if (typeof memberID !== 'string') {
			throw new EconomyError(errors.invalidType('memberID', 'string', memberID), 'INVALID_TYPE')
		}

		currency.balances[memberID] = amount

		delete currency.database
		delete currency.options
		delete currency.rawObject

		currenciesArray.splice(currencyIndex, 1, currency)
		this.database.set(`${this.guildID}.currencies`, currenciesArray)

		if (emitSet) {
			this.emit('customCurrencySet', {
				type: 'customCurrencySet',
				guildID: this.guildID,
				memberID,
				amount,
				balance: amount,
				currency: this,
				reason
			})
		}

		return amount
	}

	/**
	 * Adds the currency for specified member.
	 * @param {number} amount Amount of money to add.
	 * @param {string} memberID Member ID.
	 * @param {string} [reason] The reason why the balance was added.
	 * @returns {number} Amount of money that was added.
	 */
	addBalance(amount, memberID, reason = '') {
		const currencyBalance = this.getBalance(memberID)
		const result = this.setBalance(currencyBalance + amount, memberID, reason, false)

		this.emit('customCurrencyAdd', {
			type: 'customCurrencyAdd',
			guildID: this.guildID,
			memberID,
			amount,
			balance: currencyBalance + result,
			currency: this,
			reason
		})

		return result
	}

	/**
	 * Subtracts the currency for specified member.
	 * @param {number} amount Amount of money to subtract.
	 * @param {string} memberID Member ID.
	 * @param {string} [reason] The reason why the balance was subtracted.
	 * @returns {number} Amount of money that was subtracted.
	 */
	subtractBalance(amount, memberID, reason = '') {
		const currencyBalance = this.getBalance(memberID)
		const result = this.setBalance(currencyBalance - amount, memberID, reason, false)

		this.emit('customCurrencySubtract', {
			type: 'customCurrencySubtract',
			guildID: this.guildID,
			memberID,
			amount,
			balance: currencyBalance - result,
			currency: this,
			reason
		})

		return result
	}

	/**
	 * Saves the currency object in database.
	 * @returns {Currency} Currency instance.
	 */
	save() {
		const currenciesArray = this._all()
		const currencyIndex = currenciesArray.findIndex(currency => currency.id == this.id)

		for (const prop in this.rawObject) {
			this.rawObject[prop] = this[prop]
		}

		currenciesArray.splice(currencyIndex, 1, this.rawObject)
		this.database.set(`${this.guildID}.currencies`, currenciesArray)

		return this
	}

	/**
	 * Converts the currency object to string.
	 * @returns {string} String representation of currency object.
	 */
	toString() {
		return this.symbol ? `${this.symbol} ${this.name}` : `${this.name}`
	}

}

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
 * Currency class.
 * @type {Currency}
 */
module.exports = Currency
