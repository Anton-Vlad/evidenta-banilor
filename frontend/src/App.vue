<template>
  <main>
    <h2>Evidenta Banilor</h2>

    <section class="exisiting-reports">
      <h3>Reports</h3>

      <table style="width: 100%; border: 1px solid; padding: 10px;">
        <thead>
          <th>Name</th>
          <th>Size</th>
          <th>Last Modified</th>
          <th>Actions</th>
        </thead>

        <tbody>
          <tr v-for="row in reportsData" :key="'report-file-'+row.id">
            <td>
              {{ row.name }}
            </td>
            <td>
              {{ row.size }}
            </td>
            <td :key="'report-date-since-'+row.id+'-'+updateTimeSince">
              {{ formatTimeSince(row.modified_at) }}
            </td>
            <td>
              actions {{ row.id }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h3>Upload new Report</h3>

      <FileUpload 
        name="demo[]" 
        url="http://localhost:3000/upload" 
        customUpload 
        @uploader="uploadFile($event)" 
        :multiple="false" 
        accept="application/pdf" 
        :maxFileSize="1000000"
      >
          <template #thumbnail>
            <img src="./favicon.ico" alt="">
          </template>
          <template #empty>
              <p>Drag and drop files to here to upload.</p>
          </template>
      </FileUpload>
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
      reportsData: [],

      timeInterval: null,
      updateTimeSince: 1,
    }
  },
  async mounted() {
    await this.getExistingReports();

    this.timeInterval = setInterval(() => {
      this.updateTimeSince += 1;
    }, 30000)
  },
  destroyed() {
    clearInterval(this.timeInterval)
  },
  methods: {
    uploadFile(e) {
      this.selectedFile = e.files[0];
      console.log(this.selectedFile)
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
    },

    async getExistingReports() {
      fetch('http://localhost:3000/existing-reports', {
        method: 'GET'
      })
      .then(response => response.json())
      .then(result => {
        this.reportsData = result.files; // Handle the server response as needed
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },

    formatTimeSince(date) {
      const targetDate = new Date(date);
      const timePassed = Date.now() - targetDate.getTime();

      const secondsPassed = Math.floor(timePassed / 1000);
      const minutesPassed = Math.floor(secondsPassed / 60);
      const hoursPassed = Math.floor(minutesPassed / 60);
      const daysPassed = Math.floor(hoursPassed / 24);

      const timeUnits = [
        { unit: 'day', value: daysPassed },
        { unit: 'hour', value: hoursPassed % 24 },
        { unit: 'minute', value: minutesPassed % 60 },
        { unit: 'second', value: secondsPassed % 60 }
      ];

      // Generate the formatted string
      const formattedTimePassed = timeUnits
        .filter(({unit, value}) => value > 0) // Exclude units with a value of 0
        .map(({ unit, value }) => `${value} ${unit}${value !== 1 ? 's' : ''}`)
        .slice(0, 2)
        .join(', ');

      return formattedTimePassed;
    }
  }
};
</script>

<style scoped>
h2 {
  margin-bottom: 3rem;
}

h3 {
  margin-bottom: 1rem;
}

table {
  margin-bottom: 2rem;
}


th {
  text-align: left;
}
</style>
