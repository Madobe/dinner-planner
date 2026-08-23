import { useSorted, useStorage, type RemovableRef } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, reactive, ref, watch } from "vue";

export enum FoodType {
  Home = 1,
  Restaurant
}

export interface Food {
  lastEaten: Date
  name: string
  type: FoodType
}

const storageKey = "dinner-planner.foods"

export const useFoodsStore = defineStore( "foods", () => {
  const foods: RemovableRef<Food[]> = useStorage(
    storageKey,
    [],
    localStorage,
    {
      mergeDefaults: true,
      serializer: {
        read: v => !v ? null : JSON.parse( v ).map( ( f: Food ) => Object.assign( f, { lastEaten: new Date( f.lastEaten ) } )),
        write: v => JSON.stringify( v )
      }
    }
  )
  const filters = ref( [ FoodType.Home, FoodType.Restaurant ] )
  const sorted = useSorted( foods, ( a, b ) => a.name.localeCompare( b.name ) )
  const filtered = computed( () => sorted.value.filter( f => f.type & filters.value.reduce( ( total, value ) => total += value, 0 ) ) )

  function add ( name: string, type: FoodType ) {
    if ( foods.value.find( f => f.name === name ) ) {
      remove( name )
    } else {
      foods.value.push( { lastEaten: new Date( 0 ), name, type } )
    }
  }
  function remove ( name: string ) {
    const index = foods.value.findIndex( value => value.name === name )
    if ( index !== -1 ) foods.value.splice( index, 1 )
  }
  function get ( name: string ) {
    return foods.value.find( f => f.name === name )
  }
  function includes ( name: string ) {
    return foods.value.map( f => f.name ).includes( name )
  }
  function eat ( name: string ) {
    console.log( "Attempting to eat", name )
    const food = get( name )
    if ( food ) food.lastEaten = new Date()
  }

  return {
    add,
    eat,
    filtered,
    filters,
    foods,
    get,
    includes,
    remove,
    sorted
  }
} )