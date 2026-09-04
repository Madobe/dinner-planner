<script setup lang="ts">
import { BModal, vBModal, vBTooltip } from 'bootstrap-vue-next';
import { BButton, BCol, BContainer, BForm, BFormCheckboxGroup, BFormInput, BFormRadioGroup, BRow } from 'bootstrap-vue-next';
import { type ComponentExposed } from 'vue-component-type-helpers'
import { ref, useTemplateRef } from 'vue';
import { formatTimeAgo } from '@vueuse/core';

import { type Food, FoodType, useFoodsStore } from '@/stores/foods';
import { useScheduleStore } from '@/stores/schedule';
import { VueDraggable } from 'vue-draggable-plus';

const foodsStore = useFoodsStore()
const scheduleStore = useScheduleStore()

const inputFoodText = ref( "" )
const inputFoodType = ref( FoodType.Home )
const foodTypes = [
  { text: "Home", value: FoodType.Home },
  { text: "Restaurant", value: FoodType.Restaurant }
]
const filtersOptions = [
  { text: "Show Home Cooking", value: FoodType.Home },
  { text: "Show Restaurants", value: FoodType.Restaurant }
]

const randomSelection = ref( "" )
const randomModal = useTemplateRef<ComponentExposed<typeof BModal>>( "random-selection-modal" )

function resolveButtonVariant ( lastEaten: Date ) {
  const days = ( new Date().getTime() - lastEaten.getTime() ) / ( 1000 * 60 * 60 * 24 )

  if ( days >= 31 ) return "danger"
  else if ( days >= 15 && days <= 30 ) return "warning"
  else return "primary"
}

function resolveScheduleIcon ( name: string ) {
  const foodType = foodsStore.foods.find( f => f.name === name )?.type || 0

  if ( foodType === FoodType.Home ) return "bi-house-fill"
  else if ( foodType === FoodType.Restaurant ) return "bi-shop"
  else return "bi-question-circle"
}

function onClickFoodButton ( name: string ) {
  scheduleStore.add( name )
}

function onExport () {
  navigator.clipboard.writeText( JSON.stringify( foodsStore.foods ) )
}

function onImport () {
  navigator.clipboard
    .readText()
    .then( text => {
      let data: Food[]

      try {
        data = JSON.parse( text )
      } catch ( error ) {
        console.error( error, text )
        return
      }

      const existing = foodsStore.foods
        .map( f => f.name )
        .reduce( ( names: Set<string>, value: string ) => names.add( value ), new Set() )
      data.forEach( food => {
        if ( !existing.has( food.name ) ) foodsStore.add( food.name, food.type, food.lastEaten )
      } )
    } )
}

function onRandomize () {
  randomSelection.value = foodsStore.filtered[ Math.floor( Math.random() * foodsStore.filtered.length ) ]?.name || ""
}

function onSubmit ( event: Event | undefined ) {
  if ( event ) event.preventDefault()
  foodsStore.add( inputFoodText.value, inputFoodType.value )
  inputFoodText.value = ""
}
</script>

<template>
  <BContainer fluid class="bg-dark text-light">
    <BRow class="mb-3">
      <BCol offset="1" cols="10">
        <BForm class="d-flex flex-row" @submit="onSubmit">
          <label for="inline-form-food-text" class="col-form-label visually-hidden">Text</label>
          <div class="col me-3">
            <BFormInput type="text" v-model="inputFoodText"
              placeholder="Add new food (adding the same food removes it)"></BFormInput>
          </div>
          <label for="inline-form-food-type" class="col-form-label visually-hidden">Type</label>
          <div class="d-flex col-2 justify-content-center">
            <BFormRadioGroup class="me-3" button-variant="outline-secondary" v-model="inputFoodType"
              :options="foodTypes" buttons />
          </div>
          <div class="col-1">
            <BButton class="btn-block" variant="primary" @click="onSubmit">Add</BButton>
          </div>
        </BForm>
      </BCol>
    </BRow>



    <BRow>
      <BCol offset="1" cols="8">
        <div class="d-flex flex-wrap">
          <BButton class="me-2 mb-2" v-for=" food in foodsStore.filtered "
            :variant="resolveButtonVariant( food.lastEaten )" v-b-tooltip="formatTimeAgo( food.lastEaten )"
            @click="onClickFoodButton( food.name )">
            <i class="bi bi-house-fill me-1" v-if=" food.type === FoodType.Home "></i>
            <i class="bi bi-shop me-1" v-if=" food.type === FoodType.Restaurant "></i>
            {{ food.name }}
          </BButton>
        </div>
      </BCol>



      <BCol cols="2">
        <div class="d-grid gap-1 darkened rounded p-3 mb-3">
          <h3 class="text-center">Filters</h3>
          <BFormCheckboxGroup v-model="foodsStore.filters" :options="filtersOptions" stacked buttons
            button-variant="outline-secondary" />
          <BButton class="mt-2" v-b-modal.random-selection-modal @click="onRandomize">Pick Random Filtered</BButton>
          <hr />
        </div>
        <div class="d-grid gap-1 darkened rounded p-3 mb-3">
          <h3 class="text-center">Schedule</h3>
          <BButton variant="primary" class="btn-outlined-white" @click="foodsStore.eat( scheduleStore.shift() )">
            Advance
          </BButton>
          <hr />
          <VueDraggable class="d-grid gap-1" v-model="scheduleStore.schedule">
            <BButton :class="[ 'btn-block', scheduleStore.schedule.length >= 2 ? 'mb-2' : '' ]"
              :variant='i === 0 ? "primary" : "secondary"' v-for=" ( entry, i ) in scheduleStore.schedule "
              @click="scheduleStore.remove( i )">
              <i :class="[ 'bi', 'me-1', resolveScheduleIcon( entry ) ]"></i>
              {{ entry }}
            </BButton>
          </VueDraggable>
          <h4 class="text-center" v-if=" !scheduleStore.schedule.length ">Empty</h4>
        </div>

        <div class="d-grid gap-1 darkened rounded p-3">
          <h3 class="text-center">Legend</h3>
          <hr />
          <BButton class="w-100 mb-2" variant="danger">&gt; 31+ days</BButton>
          <BButton class="w-100 mb-2" variant="warning">15 ~ 30 days</BButton>
          <BButton class="w-100" variant="primary">&lt; 14 days</BButton>
        </div>
      </BCol>
    </BRow>
  </BContainer>



  <div class="darkened text-light fixed-left p-2 rounded-end d-flex flex-column">
    <BButton class="mb-2" @click="onImport" v-b-tooltip.right="'Import'">
      <i class="bi bi-arrow-bar-down"></i>
    </BButton>
    <BButton @click="onExport" v-b-tooltip.right="'Export'">
      <i class="bi bi-arrow-bar-up"></i>
    </BButton>
  </div>



  <BModal ref="random-selection-modal" id="random-selection-modal" title="Random Food (Obeys Filters)" no-footer>
    <div class="d-block text-center">
      <h3>{{ randomSelection }}</h3>
    </div>
    <div class="modal-footer">
      <BButton variant="primary" @click="scheduleStore.add( randomSelection ); randomModal?.hide()">Accept</BButton>
      <BButton variant="secondary" @click="onRandomize">Randomize</BButton>
      <BButton variant="secondary" @click="randomModal?.hide()">Cancel</BButton>
    </div>
  </BModal>
</template>

<style scoped>
.btn-outlined-white {
  box-shadow:
    -1px -1px #fff,
    1px -1px #fff,
    -1px 1px #fff,
    1px 1px #fff;
}

.container-fluid {
  min-height: 100vh;
  padding-top: 1.5rem;
}

.darkened {
  background-color: color-mix(in hsl, var(--bs-body-color) 90%, #000);
}

.fixed-left {
  position: fixed;
  top: 20vh;
  left: 0;
}
</style>