This lecture introduces basic comparative sorting algorithms, starting with simple $O(N^2)$ methods before moving toward faster $O(N \log N)$ ideas later.

> [!note]
> This note currently covers bubble sort, selection sort, insertion sort, and an introduction to heap sort.

# Big Picture

Sorting means putting items into ascending or descending order.

## Why Sort?

- Make finding things faster or easier
	- Example: handing back exams
- Make other queries easier
	- Example: median, quartiles, and other order statistics

## What Can Be Sorted?

We can sort anything that is **totally ordered**.

That means for any two values of the same type, we can decide whether:

- `a > b`
- `a = b`
- `a < b`

# Two Flavours of Sorting Algorithms

Most sorting algorithms in this course fall into two broad categories.

| Category | Main idea | Typical characteristics | Examples |
| -------- | --------- | ----------------------- | -------- |
| Iterative sorting | Repeatedly scan and update the data using comparisons | Simple, intuitive, often easy to code | Bubble sort, insertion sort, selection sort, heap sort |
| Divide and conquer | Recursively split data into smaller pieces, sort them, then combine results | Usually more scalable on large inputs | Merge sort, quick sort |

> [!info]
> These are **comparative sorting algorithms** because they rely on comparing elements to decide order.

# Bubble Sort

Bubble sort repeatedly sweeps through the array and swaps adjacent elements that are out of order.

## Algorithm

1. Sweep from left to right across the array.
2. Compare element `i` with element `i + 1`.
3. If they are out of order, swap them.
4. Repeat passes until the array is sorted.

## Time Complexity and Notes

| Case | Time | Notes |
| ---- | ---- | ----- |
| Worst case | $O(N^2)$ | Slow for large datasets |
| Best case | $O(N)$ | If the array is already sorted and the implementation stops early |

# Selection Sort

Selection sort repeatedly finds the smallest remaining element and places it into the next sorted position.

## Algorithm

1. Scan the array to find the smallest element.
2. Swap it with the first unsorted element.
3. Repeat on the remaining unsorted suffix.

## Why the Runtime Is $O(N^2)$

- Finding the minimum of `N` items takes $O(N)$.
- We repeat that process about `N` times.
- So the total running time is $O(N^2)$.

## Key Observations

- Selection sort is $O(N^2)$ in the best, worst, and average cases.
- It still scans for the minimum even if the array is already sorted.
- Like bubble sort, it is simple and in-place.
- It often performs fewer writes than bubble sort because it swaps less often.

> [!tip]
> Selection sort is still quadratic, but it can be preferable when minimizing memory writes matters more than minimizing comparisons.

# Insertion Sort

Insertion sort builds a sorted region one element at a time.

## Algorithm

1. Split the array into a sorted region and an unsorted region.
2. Take the next element from the unsorted region.
3. Find its correct position in the sorted region.
4. Insert it there.
5. Repeat until all elements are in the sorted region.

## Time Complexity and Notes

| Case | Time | Notes |
| ---- | ---- | ----- |
| Worst case | $O(N^2)$ | Slow for large datasets |
| Best case | $O(N)$ | If the array is already sorted, each insertion finishes quickly |

## Key Observations

- Insertion sort is in-place.
- It is similar in spirit to bubble sort.
- It can be inefficient on large arrays because inserting an element may require shifting many elements.
- A useful question is how quickly the algorithm can detect that the next item is already in the correct place.

# Comparison of the Basic $O(N^2)$ Sorts

| Algorithm      | Main action                         | Best case | Worst case | Main tradeoff                                              |
| -------------- | ----------------------------------- | --------- | ---------- | ---------------------------------------------------------- |
| Bubble sort    | Repeated adjacent swaps             | $O(N)$    | $O(N^2)$   | Very simple, but many swaps                                |
| Selection sort | Repeated minimum selection          | $O(N^2)$  | $O(N^2)$   | Fewer writes, but still scans fully                        |
| Insertion sort | Insert next item into sorted prefix | $O(N)$    | $O(N^2)$   | Good on already sorted data, but shifting can be expensive |

# Heap Sort

The first three algorithms are all quadratic. Heap sort improves the asymptotic runtime by using a heap to make repeated minimum extraction efficient.

## Why a Heap Helps

Revisiting selection sort:

- Repeatedly finding the minimum in an unsorted array costs $O(N)$.
- Doing that `N` times gives $O(N^2)$.
- So the question is whether the minimum can be maintained more efficiently.

A heap gives:

| Operation | Cost |
| --------- | ---- |
| `findMin()` | $O(1)$ |
| `insert()` | $O(\log N)$ |
| `deleteMin()` | $O(\log N)$ |

Heap sort idea:

- Put all elements into a heap.
- Repeatedly remove the minimum.

> [!note]
> In this version, a **min-heap** produces the final array in **descending** order because each deleted minimum is placed at the end of the array. A max-heap version would produce ascending order.

## Space Consideration

Heap sort can be done in place because heaps are naturally implemented using arrays.

- Extra space is $O(1)$.
- We treat the original unsorted array as a broken heap and gradually fix it.

## Step 1: Heapify

The goal of heapify is to turn the array into a valid min-heap.

### Top-Down Approach

This note uses a top-down heapify process:

1. Divide the array into a heap region and a not-yet-heap region.
2. Move the boundary one position to the right.
3. Take the newly included element and bubble it up as needed.
4. Repeat until the entire array belongs to the heap region.

> [!caution]
> This top-down build process is not the most efficient heap construction method, but it is straightforward to visualize.

### Heapify in Action

Start with the array `[3, 7, 1, 5, 9, 2]`.

1. The heap region initially contains only the first element, so `[3]` is trivially a heap.

![[heapify1.png|318]]

2. Add `7` to the heap region. Since `7 > 3`, no bubble-up is needed.

![[heapify2.png|318]]

3. Add `1`. Since `1 < 3`, it bubbles up to the root.

![[heapify3.png|315]]

4. Add `5`. It is initially placed after `3`, then bubbles up one level because `5 < 7`.

![[heapify4.png|336]]

5. Add `9`. It already satisfies the min-heap property, so no bubble-up is needed.

![[heapify5.png|381]]

6. Add `2`. It bubbles up above `3`, producing the heap `[1, 5, 2, 7, 9, 3]`.

![[heapify6.png|448]]

## Step 2: Extract and Sort

Once the heap is built, repeatedly:

1. Delete the minimum element at the root.
2. Move the last heap element into the root position.
3. Place the deleted minimum into the newly freed slot at the end of the array.
4. Bubble the new root down to restore the heap.
5. Repeat until the heap is empty.

### Heap Sort in Action

The figures show the sorted region growing from the right as minima are extracted.

1. Start from the valid min-heap `[1, 5, 2, 7, 9, 3]`.

![[heapsort1.png|452]]

2. Delete the minimum `1`, move the last heap element `3` to the root, and place `1` at the end of the array.

![[heapsort2.png|395]]

3. The new root `3` violates the min-heap property because `3 > 2`, so it must bubble down.

![[heapsort3.png|318]]

4. Swap `3` and `2` to restore the heap. The remaining unsorted region is again a valid min-heap, so the process can repeat.

![[heapsort4.png|400]]

## Heap Sort Time Complexity

| Phase | Work done | Total cost |
| ----- | --------- | ---------- |
| Heapify (top-down version used here) | `N` insertions, each with at most $O(\log N)$ bubble-up | $O(N \log N)$ |
| Extraction / sorting | `N` deletions, each with at most $O(\log N)$ bubble-down | $O(N \log N)$ |

So the total running time is:

$$
O(N \log N) + O(N \log N) = O(N \log N)
$$

## Heap Considerations

| Pros | Cons |
| ---- | ---- |
| $O(N \log N)$ time, which is asymptotically optimal for comparison sorting | Poor locality: parent and child nodes can be far apart in memory |
| $O(1)$ extra space for array-based heaps | On linked lists, heap sort is awkward and may require building a separate heap structure |

More detail on the locality issue:

- Child nodes are exponentially far from parents in the array layout.
- Example: index `10,000` has children at `20,000` and `20,001`.
- This can lead to cache misses.
- It can also increase page faults on larger data sets.

# Sorting Comparison So Far

| Algorithm      | Main idea                              | Best case                              | Worst case    | Extra space | Notes                                             |
| -------------- | -------------------------------------- | -------------------------------------- | ------------- | ----------- | ------------------------------------------------- |
| Bubble sort    | Repeated adjacent swaps                | $O(N)$                                 | $O(N^2)$      | $O(1)$      | Simple, but swap-heavy                            |
| Selection sort | Repeated minimum selection             | $O(N^2)$                               | $O(N^2)$      | $O(1)$      | Few writes, many comparisons                      |
| Insertion sort | Insert into sorted prefix              | $O(N)$                                 | $O(N^2)$      | $O(1)$      | Works well on already sorted data                 |
| Heap sort      | Build heap, then repeatedly delete min | $O(N \log N)$ in this top-down version | $O(N \log N)$ | $O(1)$      | Faster asymptotically, but weaker memory locality |
