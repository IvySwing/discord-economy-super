import DatabaseManager from './DatabaseManager'

import Emitter from '../classes/util/Emitter'
import InventoryItem from '../classes/InventoryItem'

import EconomyConfiguration from '../interfaces/EconomyConfiguration'

import ShopOperationInfo from '../interfaces/ShopOperationInfo'
import SellingOperationInfo from '../interfaces/SellingOperationInfo'

import StackedInventoryItemObject from '../interfaces/StackedInventoryItemObject'


/**
* Inventory manager methods class.
* @extends {Emitter}
*/
declare class InventoryManager extends Emitter {
    public constructor(options: EconomyConfiguration, database: DatabaseManager)

    /**
     * Uses the item from the user's inventory.
     * @param {string} itemID Item ID or name
     * @param {string} memberID Member ID
     * @param {string} guildID Guild ID
     * @param {any} client The Discord Client [Optional]
     * @returns {string} Item message 
     */
    public useItem(itemID: string | number, memberID: string, guildID: string, client?: any): string

    /**
     * Uses the item from user's inventory.
     * 
     * This method is an alias for the `InventoryManager.useItem()` method.
     * @param {string | number} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {Client} [client] The Discord Client. [Optional]
     * @returns {string} Item message or null if item not found.
     */
    public use(itemID: string | number, memberID: string, guildID: string, client?: any): string

    /**
     * Clears the user's inventory.
     * @param {string} memberID Member ID
     * @param {string} guildID Guild ID
     * @returns {boolean} If cleared: true, else: false
     */
    public clear(memberID: string, guildID: string): boolean

    /**
     * Gets the item in the inventory.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @returns {InventoryItem} If item not found: null; else: item info object.
     */
    public getItem<T extends object = any>(itemID: string | number, memberID: string, guildID: string): InventoryItem<T>

    /**
     * Gets the item in the inventory.
     * 
     * This method is an alias for the `InventoryManager.getItem()` method.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @returns {InventoryItem} If item not found: null; else: item info object.
     */
    public findItem<T extends object = any>(itemID: string | number, memberID: string, guildID: string): InventoryItem<T>

    /**
     * Adds the item from the shop to user's inventory.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {number} [quantity=1] Quantity of items to add. Default: 1.
     * @returns {ShopOperationInfo} Operation info object.
     */
    public addItem<
        T extends object = any
    >(
        itemID: string | number,
        memberID: string,
        guildID: string,
        quantity?: number
    ): ShopOperationInfo<T>

    /**
     * Returns the stacked item in user inventory: it will have the quantity and total price of the item.
     * @param {string | number} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.s
     * @returns {StackedInventoryItemObject} Stacked item object.
     */
    public stack<
        T extends object = any
    >(itemID: string | number, memberID: string, guildID: string): StackedInventoryItemObject<T>

    /**
     * Returns the stacked user's inventory -
     * an array of objects of item's quantity, total price and the item itself from user's inventory
     * for each unique item.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @returns {StackedInventoryItemObject[]} Stacked user's inventory.
     */
    public stacked<
        T extends object = any
    >(memberID: string, guildID: string): StackedInventoryItemObject<T>[]

    /**
     * Shows all items in user's inventory.
     * @param {string} memberID Member ID
     * @param {string} guildID Guild ID
     * @returns The user's inventory array.
     */
    public fetch<T extends object = any>(memberID: string, guildID: string): InventoryItem<T>[]

    /**
     * Shows all items in user's inventory.
     * 
     * This method is an alias for the `InventoryManager.fetch()` method.
     * @param {string} memberID Member ID
     * @param {string} guildID Guild ID
     * @returns The user's inventory array.
     */
    public get<T extends object = any>(memberID: string, guildID: string): InventoryItem<T>[]

    /**
     * Removes the item from user's inventory
     * and adds its price to the user' balance.
     * This is the same as selling something.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {number} [quantity=1] Quantity of items to sell.
     * @returns {SellingOperationInfo} Selling operation info.
     */
    public sellItem<
        T extends object = any
    >(
        itemID: string | number,
        memberID: string,
        guildID: string,
        quantity?: number,
        reason?: string
    ): SellingOperationInfo<T>

    /**
     * Removes the item from user's inventory
     * and adds its price to the user's balance.
     * This is the same as selling something.
     * 
     * This method is an alias for 'InventoryManager.sellItem()' method.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {number} [quantity=1] Quantity of items to sell.
     * @param {string} [reason='sold the item from the inventory'] The reason why the item was sold.
     * @returns {SellingOperationInfo} Selling operation info.
     */
    public sell<
        T extends object = any
    >(
        itemID: string | number,
        memberID: string,
        guildID: string,
        quantity?: number,
        reason?: string
    ): SellingOperationInfo<T>

    /**
     * Removes the item from user's inventory.
     * @param {string} itemID Item ID or name.
     * @param {string} memberID Member ID.
     * @param {string} guildID Guild ID.
     * @param {number} [quantity=1] Quantity of items to sell.
     * @returns {boolean} If removed successfully: true, else: false.
     */
    public removeItem(itemID: string | number, memberID: string, guildID: string, quantity?: number): boolean
}

export = InventoryManager