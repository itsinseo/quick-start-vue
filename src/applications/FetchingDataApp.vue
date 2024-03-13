<!--
This example fetches latest commit data from GitHub’s API and displays them as a list.
You can switch between the two branches.
-->

<script setup>
import { ref, watchEffect } from 'vue'

const API_URL = `https://api.github.com/repos/itsinseo/redis-review/commits?per_page=3&sha=`
const branches = ['main', 'chat']

const currentBranch = ref(branches[0])
const commits = ref(null)

watchEffect(async () => {
  // this effect will run immediately and then
  // re-run whenever currentBranch.value changes
  const url = `${API_URL}${currentBranch.value}`
  commits.value = await (await fetch(url)).json()
})

function truncate(v) {
  const newline = v.indexOf('\n')
  return newline > 0 ? v.slice(0, newline) : v
}

function formatDate(v) {
  return v.replace(/T|Z/g, ' ')
}
</script>

<template>
  <div>
    <h1>Latest itsinseo's redis-review Core Commits</h1>
    <p>itsinseo/redis-review@{{ currentBranch }}</p>
    <template v-for="branch in branches">
      <input type="radio" :id="branch" :value="branch" name="branch" v-model="currentBranch">
      <label :for="branch">{{ branch }}</label>
    </template>
    <ul>
      <li v-for="{ html_url, sha, author, commit } in commits">
        <a :href="html_url" target="_blank" class="commit">{{ sha.slice(0, 7) }}</a>
        - <span class="message">{{ truncate(commit.message) }}</span><br>
        by <span class="author">
          <a :href="author.html_url" target="_blank">{{ commit.author.name }}</a>
        </span>
        at <span class="date">{{ formatDate(commit.author.date) }}</span>
      </li>
    </ul>
  </div>

</template>

<style>
a {
  text-decoration: none;
  color: #42b883;
}

li {
  line-height: 1.5em;
  margin-bottom: 20px;
}

.author,
.date {
  font-weight: bold;
}
</style>