import Emitter from '../classes/util/Emitter'

import EconomyOptions from '../interfaces/EconomyOptions'
import LeaderboardData from '../interfaces/LeaderboardData'

/**
 * Bank balance manager methods object.
 * @extends {Emitter}
 */
declare class BankManager extends Emitter {
    public constructor(options: EconomyOptions)

    /**
    * Fetches the user's bank balance.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @returns {Promise<number>} User's bank balance.
    */
    public fetch(memberID: string, guildID: string): Promise<number>

    /**
    * Gets the user's bank balance.
    * 
    * This method is an alias for the `BankManager.fetch()` method.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @returns {Promise<number>} User's bank balance.
    */
    public get(memberID: string, guildID: string): Promise<number>

    /**
    * Sets the money amount on user's bank balance.
    * @param {number} amount Amount of money that you want to set.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @param {string} reason The reason why you set the money.
    * @returns {Promise<number>} Money amount.
    */
    public set(amount: number, memberID: string, guildID: string, reason?: string): Promise<number>

    /**
    * Adds the money amount on user's bank balance.
    * @param {number} amount Amount of money that you want to add.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @param {string} reason The reason why you add the money.
    * @returns {Promise<number>} Money amount.
    */
    public add(amount: number, memberID: string, guildID: string, reason?: string): Promise<number>

    /**
    * Subtracts the money amount from user's bank balance.
    * @param {number} amount Amount of money that you want to subtract.
    * @param {string} memberID Member ID.
    * @param {string} guildID Guild ID.
    * @param {string} reason The reason why you subtract the money.
    * @returns {Promise<number>} Money amount.
    */
    public subtract(amount: number, memberID: string, guildID: string, reason?: string): Promise<number>

    /**
    * Shows a bank money leaderboard for specified guild.
    * @param {string} guildID Guild ID.
    * @returns {Promise<LeaderboardData[]>} Sorted leaderboard array.
    */
    public leaderboard(guildID: string): Promise<LeaderboardData[]>
}

export = BankManager