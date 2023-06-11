<template>
  <main>
    <h2>Evidenta Banilor</h2>

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

    <section class="exisiting-statements">
      <h3>Raw Statements</h3>

      <DataTable 
        v-model:editingRows="editingRows" :value="rawStatements" editMode="row" dataKey="id"
        @row-edit-save="onRowEditSave" 
        tableClass="editable-cells-table" tableStyle="min-width: 50rem"
      >
          <Column field="name" header="Name" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>

          <Column field="month" header="Month" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>

          <Column field="year" header="Year" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>
          
          <Column field="bank" header="Bank" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>
          
          <Column field="size" header="Size" style="width: 20%">
            <template #body="slotProps">
              {{ slotProps.data.size }}
            </template>
          </Column>
          
          <Column field="pageDelimitor" header="Delimitor" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>

          <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
      </DataTable>
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
      rawStatements: [],
      editingRows: [],

      timeInterval: null,
      updateTimeSince: 1,
    }
  },
  async mounted() {
    // await this.getExistingReports();

    // this.timeInterval = setInterval(() => {
    //   this.updateTimeSince += 1;
    // }, 30000)
  },
  destroyed() {
    // clearInterval(this.timeInterval)
  },
  methods: {
    uploadFile(e) {
      this.selectedFile = e.files[0];
      
      const formData = new FormData();
      formData.append('extras', this.selectedFile);
      
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(result => {

        this.tableData.length = 0;
        this.tableData = result;
        console.log(result); // Handle the server response as needed

        // populate rawStatements
        this.rawStatements = result
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
    },


    async onRowEditSave(params) {
      const newData = {...params.newData};

      try {
        const response = await fetch("http://localhost:3000/edit-statement", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newData)
        });
        if (!response.ok) {
          throw new Error('HTTP Error: ' + response.status);
        }
        const data = await response.json();

        // overwrite the row of rawStatements
        this.rawStatements = this.rawStatements.map((obj) => {
          if (obj.id == data.id) {
            return data;
          } else {
            return obj;
          }
        });

        console.log('NEW TABLE', data)

      } catch (error) {
        console.error('Error:', error);
      }
    },
    async postEditData(url) {
      
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
