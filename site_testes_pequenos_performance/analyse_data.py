import pandas
import pandasql
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy

def remove_Trailing_Space(x):
    if(type(x) == str):
        return x.strip()
    else:
        return x

def string_To_List(string):
    string_list = string.split(' ')
    return list(map(lambda x: float(x), string_list))

total_data = pandas.read_csv('Perf_results.tsv', sep='\t')

# Remove unecessary spaces
total_data.columns = list(map(remove_Trailing_Space, total_data.columns))
total_data = total_data.applymap(remove_Trailing_Space)

# Transform the timings into arrays
# Calculate averages
total_data['Miliseconds'] = total_data['Miliseconds'].apply(string_To_List)
total_data['Mean_miliseconds'] = total_data['Miliseconds'].apply(lambda x: numpy.mean(x))

total_data['Microseconds'] = total_data['Microseconds'].apply(string_To_List)
total_data['Mean_microseconds'] = total_data['Microseconds'].apply(lambda x: numpy.mean(x))

# Not necessary, the resolution is in microseconds anyways (browser)
total_data = total_data.drop(columns=['Nanoseconds']) 

# Index all items - preserve across queries
total_data['Index'] = total_data.index.values.tolist()

# Necessary for pandasql to work
data_without_timings = total_data.drop(columns=['Miliseconds', 'Microseconds'])

print(total_data)

# Bar plot
startup_tests = pandasql.sqldf("""SELECT * FROM data_without_timings WHERE Test_program LIKE 'return_0%' AND Command NOT LIKE '%podman%' ORDER BY Mean_microseconds """)

print(startup_tests)

plt.rcParams.update({'font.size': 40})
plt.subplots(figsize=(50,50))
plt.xticks(rotation=45, horizontalalignment='right')
plt.subplots_adjust(bottom=0.3)
plt.xlabel('Programas de teste', fontsize=45)
plt.ylabel('Médias dos tempos (ms)', fontsize=45)
plt.title('Tempos de inicialização', fontsize=50)

positions = range(0, startup_tests.shape[0]*2, 2)
colors = startup_tests['Type'].map({'native': 'blue', 'web_wasm': 'yellow', 'container': 'green', 'custom_container': 'orange'})
legend_handles = []

bars = plt.bar(positions, startup_tests['Mean_microseconds'].astype(int), tick_label=startup_tests['Alias'], color=colors)

plt.grid(color='gray', linestyle=':', linewidth=2)
for index, item in enumerate(startup_tests['Type'].unique()):
    legend_handles.append(mpatches.Patch(color=colors.unique()[index], label=item))
plt.legend(handles=legend_handles, fontsize=45)

# https://stackoverflow.com/questions/53066633/python-how-to-show-values-on-top-of-bar-plot
for bar in bars:
    yval = bar.get_height()
    print(bar.get_x(), bar.get_width())
    if(len(str(yval)) == 2):
        plt.text(bar.get_x() + bar.get_width()/3, yval + .005, yval)
    elif(len(str(yval)) == 3):
        plt.text(bar.get_x() + bar.get_width()/4, yval + .005, yval)
    else:
        plt.text(bar.get_x() + bar.get_width()/7, yval + .005, yval)
plt.savefig('Startup.pdf', format='pdf', orientation='landscape')


#plt.plot(total_data['Miliseconds'][3], linewidth=5)
plt.plot(total_data['Microseconds'][0], linewidth=5, marker='o', markersize=10)
plt.plot(total_data['Microseconds'][4], color='red', linewidth=5, marker='o', markersize=10)
plt.plot(total_data['Microseconds'][6], color='green', linewidth=5, marker='o', markersize=10)
#plt.show()