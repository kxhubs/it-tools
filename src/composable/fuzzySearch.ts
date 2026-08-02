import { type MaybeRef, get } from '@vueuse/core';
import Fuse from 'fuse.js';
import { type Ref, computed, ref, shallowRef, watch } from 'vue';

export { useFuzzySearch };

function useFuzzySearch<Data>({
  search,
  data,
  options = {},
}: {
  search: MaybeRef<string>
  data: MaybeRef<Data[]>
  options?: Fuse.IFuseOptions<Data> & { filterEmpty?: boolean }
}) {
  // 支持响应式数据:data 为 Ref 时,数据变化会重建 Fuse(如语言切换后的翻译数据)
  const dataRef = ref(data) as Ref<Data[]>;
  const filterEmpty = options.filterEmpty ?? true;

  const fuse = shallowRef(new Fuse(get(dataRef), options));
  watch(dataRef, (newData) => {
    fuse.value = new Fuse(newData, options);
  });

  const searchResult = computed<Data[]>(() => {
    const query = get(search);

    if (!filterEmpty && query === '') {
      return get(dataRef);
    }

    return fuse.value.search(query).map(({ item }) => item);
  });

  return { searchResult };
}
