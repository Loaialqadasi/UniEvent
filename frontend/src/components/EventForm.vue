<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  busy: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = reactive({
  title: '',
  category: 'Technology',
  date: '',
  time: '',
  venue: '',
  capacity: '',
  price: '',
  description: '',
})

const errors = reactive({})

const reset = () => {
  form.title = ''
  form.category = props.categories[0] ?? 'Technology'
  form.date = ''
  form.time = ''
  form.venue = ''
  form.capacity = ''
  form.price = ''
  form.description = ''

  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset()
    }
  }
)

const validate = () => {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })

  if (form.title.trim().length < 4) {
    errors.title = 'Title must be at least 4 characters.'
  }

  if (!form.date) {
    errors.date = 'Date is required.'
  }

  if (!form.time) {
    errors.time = 'Time is required.'
  }

  if (!form.venue.trim()) {
    errors.venue = 'Venue is required.'
  }

  const capacity = Number(form.capacity)
  if (!capacity || capacity < 10) {
    errors.capacity = 'Capacity must be at least 10.'
  }

  if (!form.price.trim()) {
    errors.price = 'Price label is required.'
  }

  if (form.description.trim().length < 12) {
    errors.description = 'Description must be at least 12 characters.'
  }

  return Object.keys(errors).length === 0
}

const handleSubmit = () => {
  if (!validate()) {
    return
  }

  emit('submit', {
    ...form,
    capacity: Number(form.capacity),
    attendees: 0,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  })
}
</script>

<template>
  <aside v-if="modelValue" class="event-form panel">
    <div class="event-form__head">
      <h2>Create New Event</h2>
      <button class="button button--ghost" type="button" @click="emit('update:modelValue', false)">
        Close
      </button>
    </div>

    <div class="event-form__grid">
      <div class="field">
        <label for="title">Event title</label>
        <input id="title" v-model="form.title" class="input" type="text" placeholder="Tech Innovation Summit" />
        <p v-if="errors.title" class="field__error">{{ errors.title }}</p>
      </div>

      <div class="field">
        <label for="category">Category</label>
        <select id="category" v-model="form.category" class="select">
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div class="field">
        <label for="date">Date</label>
        <input id="date" v-model="form.date" class="input" type="date" />
        <p v-if="errors.date" class="field__error">{{ errors.date }}</p>
      </div>

      <div class="field">
        <label for="time">Time</label>
        <input id="time" v-model="form.time" class="input" type="text" placeholder="10:00 AM - 12:00 PM" />
        <p v-if="errors.time" class="field__error">{{ errors.time }}</p>
      </div>

      <div class="field">
        <label for="venue">Venue</label>
        <input id="venue" v-model="form.venue" class="input" type="text" placeholder="Main Hall" />
        <p v-if="errors.venue" class="field__error">{{ errors.venue }}</p>
      </div>

      <div class="field">
        <label for="capacity">Capacity</label>
        <input id="capacity" v-model="form.capacity" class="input" type="number" min="10" />
        <p v-if="errors.capacity" class="field__error">{{ errors.capacity }}</p>
      </div>

      <div class="field">
        <label for="price">Price label</label>
        <input id="price" v-model="form.price" class="input" type="text" placeholder="Free" />
        <p v-if="errors.price" class="field__error">{{ errors.price }}</p>
      </div>

      <div class="field field--full">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="textarea"
          placeholder="Describe what participants will experience..."
        ></textarea>
        <p v-if="errors.description" class="field__error">{{ errors.description }}</p>
      </div>
    </div>

    <button type="button" class="button button--primary" :disabled="busy" @click="handleSubmit">
      {{ busy ? 'Saving...' : 'Publish Event' }}
    </button>
  </aside>
</template>

<style scoped>
.event-form {
  padding: 18px;
}

.event-form__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.event-form h2 {
  margin: 0;
  font-size: 1.1rem;
}

.event-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.field--full {
  grid-column: 1 / -1;
}

@media (max-width: 760px) {
  .event-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
