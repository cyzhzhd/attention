<template>
    <div>
        <p>{{ name }}</p>   <br>
        <button @click="updateName()">Change Name</button> 
    </div>    
</template>

<script>
export default {
  data () {
    return {
      name: 'Dongkyu'
    }
  },
  methods: {
    updateName () {
      this.name = 'Dongkyu Lee'
    }
  }
}
</script>

<style scoped>

</style>
