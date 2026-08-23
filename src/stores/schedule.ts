import { useStorage, type RemovableRef } from "@vueuse/core";
import { defineStore } from "pinia";

const storageKey = "dinner-planner.schedule"

export const useScheduleStore = defineStore( "schedule", () => {
  const schedule: RemovableRef<string[]> = useStorage( storageKey, [] )
  function add ( name: string ) {
    schedule.value.push( name )
  }
  function shift () {
    return schedule.value.shift() || ""
  }
  function pop () {
    return schedule.value.pop() || ""
  }
  function remove ( i: number ) {
    return schedule.value.splice( i, 1 )
  }

  return { schedule, add, shift, pop, remove }
})