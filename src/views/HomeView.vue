<script setup lang="ts">
import { BButton, BCol, BContainer, BForm, BFormCheckboxGroup, BFormInput, BFormRadioGroup, BRow } from 'bootstrap-vue-next';
import { computed, ref } from 'vue';
import { formatTimeAgo } from '@vueuse/core';

import { FoodType, useFoodsStore } from '@/stores/foods';
import { useScheduleStore } from '@/stores/schedule';

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

function resolveButtonVariant ( lastEaten: Date ) {
  const days = ( new Date().getTime() - lastEaten.getTime() ) / ( 1000 * 60 * 60 * 24 )

  if ( days > 14 ) return "danger"
  else if ( days < 14 && days > 7 ) return "warning"
  else return "primary"
}

function onAdvance () {
  const food = scheduleStore.shift()
  foodsStore.eat( food )
}

function onClickFoodButton ( name: string ) {
  scheduleStore.add( name )
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
            <BButton class="w-100" variant="primary" @click="onSubmit">Add</BButton>
          </div>
        </BForm>
      </BCol>
    </BRow>



    <BRow>
      <BCol offset="1" cols="8">
        <div class="d-flex flex-wrap">
          <BButton class="me-2 mb-2" v-for=" food in foodsStore.filtered " :variant="resolveButtonVariant( food.lastEaten )"
            v-b-tooltip :title="formatTimeAgo( food.lastEaten )" @click="onClickFoodButton( food.name )">
            {{ food.name }}
          </BButton>
        </div>
      </BCol>



      <BCol cols="2">
        <div class="darkened rounded p-3 mb-3">
          <h3 class="text-center">Filters</h3>
          <BFormCheckboxGroup class="w-100" v-model="foodsStore.filters" :options="filtersOptions" stacked buttons
            button-variant="outline-secondary" />
          <hr />
        </div>
        <div class="darkened rounded p-3 mb-3">
          <h3 class="text-center">Schedule</h3>
          <BButton class="w-100" variant="primary" @click="foodsStore.eat( scheduleStore.shift() )">Advance</BButton>
          <hr />
          <BButton :class="[ 'w-100', scheduleStore.schedule.length >= 2 ? 'mb-2' : '' ]"
            :variant='i === 0 ? "primary" : "secondary"' v-for=" ( entry, i ) in scheduleStore.schedule "
            @click="scheduleStore.remove( i )">
            {{ entry }}
          </BButton>
          <h3 class="text-center" v-if=" !scheduleStore.schedule.length ">Nothing<br />Planned</h3>
        </div>

        <div class="darkened rounded p-3">
          <h3 class="text-center">Legend</h3>
          <hr />
          <BButton class="w-100 mb-2" variant="danger">&gt; 14 days</BButton>
          <BButton class="w-100 mb-2" variant="warning">7 ~ 13 days</BButton>
          <BButton class="w-100" variant="primary">&lt; 7 days</BButton>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped>
.container-fluid {
  min-height: 100vh;
  padding-top: 1.5rem;
}

.darkened {
  background-color: color-mix(in hsl, var(--bs-body-color) 90%, #000);
}
</style>