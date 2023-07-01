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

    <section class="exisiting-statements" style="margin-top: 32px;">
      <h3>Raw Statements</h3>

      <DataTable 
        v-model:editingRows="editingRows" :value="rawStatements" editMode="row" dataKey="id"
        @row-edit-save="onRowEditSave" @row-edit-init="onRowEditInit" @row-edit-cancel="onRowEditCancel"
        tableClass="editable-cells-table" tableStyle="min-width: 50rem"
      >
          <Column field="name" header="Name" style="width: 20%">
              <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
              </template>
          </Column>

          <Column field="month" header="Month" style="width: 20%">
              <template #editor="{ data, field }">
                  <Dropdown 
                    v-model="data[field]" 
                    :options="availableMonths" 
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a Month" 
                    class="w-full md:w-14rem" 
                  />
              </template>
              <template #body="slotProps">
              {{ slotProps.data.month || 'none' }}
              </template>
          </Column>

          <Column field="year" header="Year" style="width: 20%">
              <template #editor="{ data, field }">
                  <Dropdown 
                    v-model="data[field]" 
                    :options="availableYears" 
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a Year" 
                    class="w-full md:w-14rem" 
                  />
              </template>
              <template #body="slotProps">
                {{ slotProps.data.year || 'none' }}
              </template>
          </Column>
          
          <Column field="bank" header="Bank" style="width: 20%">
              <template #editor="{ data, field }">
                  <Dropdown 
                    v-model="data[field]" 
                    :options="availableBanks" 
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a Bank" 
                    class="w-full md:w-14rem" 
                  />
              </template>
              <template #body="slotProps">
                {{ slotProps.data.bank || 'none' }}
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
              <template #body="slotProps">
                {{ slotProps.data.pageDelimitor || 'none' }}
              </template>
          </Column>

          <Column v-if="!isRowEditorMode" header="Actions" bodyStyle="text-align:center">
            <template #body="slotProps">
              <div style="display: flex; gap: 8px;">
                <Button :disabled="!canTriggerParse(slotProps.data)" icon="pi pi-play" aria-label="Trigger" size="small" @click="triggerParseStatement(slotProps.data.id)"/>
                <Button icon="pi pi-trash" aria-label="Trigger" size="small" severity="danger" @click="triggerTrashStatement(slotProps.data.id)"/>
              </div>
            </template>
          </Column>

          <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
      </DataTable>
    </section>




    <section class="exisiting-statements" style="margin-top: 32px;">
      <h3>Raw Reports</h3>
      
      <DataTable 
        v-model="rawReports" :value="rawReports" dataKey="id"
        tableClass="editable-cells-table" tableStyle="min-width: 50rem"
      >
          <Column field="id" header="ID" style="width: 20%">
              <template #body="slotProps">
                {{ slotProps.data.id || 'none' }}
              </template>
          </Column>
          <Column field="name" header="Name">
              <template #body="slotProps">
                {{ slotProps.data.name || 'none' }}
              </template>
          </Column>
          <Column field="transactions_count" header="Transactions" style="width: 20%">
              <template #body="slotProps">
                {{ slotProps.data.transactions_count || 'none' }}
              </template>
          </Column>

          <Column header="Actions" bodyStyle="text-align:center" style="width: 20%">
            <template #body="slotProps">
              <div style="display: flex; gap: 8px;">
                <Button icon="pi pi-eye" aria-label="Trigger" size="small" severity="success" @click="viewSingleReport(slotProps.data.id)"/>
              </div>
            </template>
          </Column>
      </DataTable>
    </section>
  </main>



</template>

<script>
export default {
  data() {
    return {
      rawReports: [],
      rawStatements: [],
      editingRows: [],

      timeInterval: null,
      updateTimeSince: 1,

      isRowEditorMode: false,
      availableMonths: [
        { label: 'Ianuarie',  value: 'ianuarie' },
        { label: 'Februarie', value: 'februarie' },
        { label: 'Martie',    value: 'martie' },
        { label: 'Aprilie',   value: 'aprilie' },
        { label: 'Mai',       value: 'mai' },
        { label: 'Iunie',     value: 'iunie' },
        { label: 'Iulie',     value: 'iulie' },
        { label: 'August',    value: 'august' },
        { label: 'Septembrie',value: 'septembrie' },
        { label: 'Octombrie', value: 'octombrie' },
        { label: 'Noiembrie', value: 'noiembrie' },
        { label: 'Decembrie', value: 'decembrie' },
      ],
      availableYears: [
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' },
        { label: '2021', value: '2021' },
        { label: '2020', value: '2020' },
        { label: '2019', value: '2019' },
      ],
      availableBanks: [
        { label: 'ING', value: 'ING' },
        { label: 'BT', value: 'BT' },
      ]
    }
  },
  async mounted() {
    await this.getExistingStatements();
    await this.getRawReports();

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
        // populate rawStatements
        this.rawStatements.length = 0;
        this.rawStatements = result
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },

    async getRawReports() {
      fetch('http://localhost:3000/raw-reports', {
        method: 'GET'
      })
      .then(response => response.json())
      .then(result => {
        this.rawReports = result;

        console.log(this.rawReports)
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },

    async getExistingStatements() {
      try {
        const response = await fetch('http://localhost:3000/statements', {
          method: 'GET'
        })
      
        if (!response.ok) {
          throw new Error('HTTP Error: ' + response.status);
        }
        this.rawStatements = await response.json();

      } catch (error) {
        console.error('Error:', error);
      }
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

    canTriggerParse(rowData) {
      if (
        (!rowData.month || !rowData.year || !rowData.bank || !rowData.pageDelimitor || !rowData.name) 
        || 
        (!rowData.month.length || !rowData.year.length || !rowData.bank.length || !rowData.pageDelimitor.length || !rowData.name.length)
      ) {
        return false;
      }

      return true;
    },
    async onRowEditSave(params) {
      const newData = {...params.newData};
      this.isRowEditorMode = false;

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

      } catch (error) {
        console.error('Error:', error);
      }
    },
    onRowEditInit() {
      console.log('ROW EDIT INIT')
      this.isRowEditorMode = true;
    },
    onRowEditCancel() {
      console.log('ROW EDIT CANCEL')
      this.isRowEditorMode = false;
    },

    async triggerParseStatement(statementId) {
      try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
          "id": statementId
        });

        let requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw
        };

        const response = await fetch('http://localhost:3000/generate-report', requestOptions)
      
        if (!response.ok) {
          throw new Error('HTTP Error: ' + response.status);
        }

        let responseData = await response.text();
        responseData = JSON.parse(responseData);
        alert(responseData.success)

        await this.getRawReports();

      } catch (error) {
        console.error('Error:', error);
      }
    },

    async triggerTrashStatement(statementId) {
      console.log('TRASH STATEMENT: ' + statementId)
      try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
          "id": statementId
        });

        let requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw
        };

        const response = await fetch('http://localhost:3000/delete-statement', requestOptions)
      
        if (!response.ok) {
          throw new Error('HTTP Error: ' + response.status);
        }

        this.rawStatements = await response.json();
        alert("Statement DELETED successfully!")

      } catch (error) {
        console.error('Error:', error);
      }
    },

    viewSingleReport(rawReportId) {
      console.log('View Raw Report: ' + rawReportId)
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
