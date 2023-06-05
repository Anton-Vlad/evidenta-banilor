<script setup>

</script>

<template>
  

  <main>
    <h2>Evidenta Banilor</h2>

    <section>
      <div>
        <input type="file" ref="fileInput" @change="handleFileUpload" />
        <button @click="uploadFile">Upload</button>
      </div>
    </section>


    <section v-if="tableData.length">
      <table style="width: 100%; border: 1px solid; padding: 10px;">
        <thead>
          <th>Data</th>
          <th>Tip</th>
          <th>Pret</th>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.id">
            <td>
              {{ row.date }}
            </td>
            <td>
              {{ row.type }}
            </td>
            <td>
              {{ row.price }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>



</template>

<script>
export default {
  data() {
    return {
      tableData: [],
    }
  },
  methods: {
    handleFileUpload() {
      this.selectedFile = this.$refs.fileInput.files[0];
    },
    uploadFile() {
      const formData = new FormData();
      formData.append('pdfFile', this.selectedFile);
      
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(result => {

        this.tableData.length = 0;
        this.tableData = result;
        console.log(result); // Handle the server response as needed
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }
};
</script>

<style scoped>

</style>
