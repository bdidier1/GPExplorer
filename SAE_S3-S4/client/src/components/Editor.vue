<template>
  <Editor
    api-key="eef4ylbt0pkkocrf7s3fg19qq8oq1953babmftiqssvouhlq" 
    :init="{
      selector: 'input',
      plugins: [
        // plugins d'édition de base version gratuite
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 
        'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'
      ],
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
      height: 400,
      menubar: false,
      branding: false,
      promotion: false
    }"
    v-model="content"
  />
</template>

<script setup>
import { ref } from 'vue'
import Editor from '@tinymce/tinymce-vue'

const content = ref('text')



</script>
