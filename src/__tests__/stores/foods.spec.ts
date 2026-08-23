import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'

import { FoodType, useFoodsStore } from '../../stores/foods'

describe( "foods", () => {
  beforeEach( () => {
    setActivePinia( createPinia() )
  } )

  afterEach( () => {
    localStorage.clear()
  } )

  it( "can add food", () => {
    const store = useFoodsStore()
    store.add( "Banana", FoodType.Home )
    expect( store.includes( "Banana" ) ).toBe( true )
  } )

  it( "can remove food", () => {
    const store = useFoodsStore()
    store.add( "Banana", FoodType.Home )
    expect( store.includes( "Banana" ) ).toBe( true )
    store.remove( "Banana" )
    expect( store.includes( "Banana" ) ).toBe( false )
  } )

  it( "removes when attempting to add a duplicate food", () => {
    const store = useFoodsStore()
    store.add( "Banana", FoodType.Home )
    expect( store.foods.length ).toBe( 1 )
    store.add( "Banana", FoodType.Home )
    expect( store.foods.length ).toBe( 0 )
  } )

  it( "can retrieve food entries", () => {
    const store = useFoodsStore()
    store.add( "Banana", FoodType.Home )
    expect( store.get( "Banana" )?.name ).toBe( "Banana" )
  } )

  it( "can eat food", () => {
    const store = useFoodsStore()
    store.add( "Banana", FoodType.Home )
    expect( store.get( "Banana" )?.lastEaten ).toEqual( new Date( 0 ) )
    store.eat( "Banana" )
    expect( store.get( "Banana" )?.lastEaten ).toBeTypeOf( "object" )
  } )
} )