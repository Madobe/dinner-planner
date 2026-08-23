import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useScheduleStore } from "../../stores/schedule"
import { createPinia, setActivePinia } from "pinia";

describe( "schedule", () => {
  beforeEach( () => {
    setActivePinia( createPinia() )
  } )

  afterEach( () => {
    localStorage.clear()
  } )

  it( "can add entries", () => {
    const store = useScheduleStore()
    store.add( "Banana" )
    expect( store.schedule.length ).toBe( 1 )
    expect( store.schedule.at( 0 ) ).toBe( "Banana" )
  } )

  it( "can advance the queue", () => {
    const store = useScheduleStore()
    store.add( "Banana" )
    expect( store.schedule.length ).toBe( 1 )
    expect( store.schedule.shift() ).toBe( "Banana" )
    expect( store.schedule.length ).toBe( 0 )
  } )

  it( "can remove the last added entry", () => {
    const store = useScheduleStore()
    store.add( "Banana" )
    store.add( "Apple" )
    store.add( "Cinnamon" )
    expect( store.schedule.length ).toBe( 3 )
    expect( store.schedule.pop() ).toBe( "Cinnamon" )
    expect( store.schedule.length ).toBe( 2 )
  } )

  it( "can remove at a specific index", () => {
    const store = useScheduleStore()
    store.add( "Apple" )
    store.add( "Banana" )
    store.add( "Cinnamon" )
    store.add( "Donut" )
    expect( store.remove( 2 ) ).toEqual( [ "Cinnamon" ] )
    expect( store.schedule.length ).toBe( 3 )
  } )
} )