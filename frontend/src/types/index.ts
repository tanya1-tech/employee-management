// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  username: string
  email: string
  role: 'hr' | 'employee'
  name: string
  employeeId?: string
  department?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  name?: string
  role?: 'hr' | 'employee'
  employeeId?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordData {
  userId: string
  newPassword?: string
}

// ============================================
// EMPLOYEE TYPES
// ============================================

export interface Employee {
  _id?: string
  id?: string
  employeeId: string
  name: string
  department: string
  email: string
  phone?: string
  position?: string
  joiningDate?: string
  status: 'active' | 'inactive' | 'terminated'
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeeData {
  name: string
  department: string
  email: string
  phone?: string
  position?: string
  status?: 'active' | 'inactive' | 'terminated'
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id?: string
}

// ============================================
// ATTENDANCE TYPES
// ============================================

export interface Attendance {
  _id?: string
  id?: string
  employeeId: string | Employee
  employeeName?: string
  employeeIdNumber?: string
  department?: string
  date: string | Date
  status: 'present' | 'absent' | 'late' | 'half-day' | 'not-marked'
  checkInTime?: string | Date
  checkOutTime?: string | Date
  checkIn?: string
  checkOut?: string
  remarks?: string
  attendanceId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttendanceData {
  employeeId?: string
  status: string
  checkInTime?: Date | string
  checkOutTime?: Date | string
  date?: string
}

export interface UpdateAttendanceData {
  status?: string
  checkInTime?: Date | string
  checkOutTime?: Date | string
  date?: string
  remarks?: string
}

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  halfDay?: number
  total?: number
  totalMarked?: number
  totalEmployees?: number
  rate?: number
}

export interface AttendanceSummary {
  today: {
    present: number
    absent: number
    late: number
    halfDay: number
    totalMarked: number
    totalEmployees: number
    rate: number
  }
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday?: number
  halfDayToday?: number
  attendanceRate: number
}

export interface RecentActivity {
  id: string
  icon: string
  description: string
  time: string | Date
  status: string
  statusClass: string
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: RecentActivity[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
  message?: string
}

export interface EmployeesResponse {
  success: boolean
  employees: Employee[]
  message?: string
}

export interface AttendanceResponse {
  success: boolean
  attendance: Attendance[]
  stats?: AttendanceStats
  date?: Date | string
  total?: number
  message?: string
}

export interface DashboardResponse {
  success: boolean
  stats: DashboardStats
  recentActivities: RecentActivity[]
  message?: string
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// FILTER TYPES
// ============================================

export interface AttendanceFilterParams {
  startDate?: string
  endDate?: string
  employeeId?: string
  status?: string
  department?: string
}

export interface EmployeeFilterParams {
  search?: string
  department?: string
  status?: 'active' | 'inactive' | 'terminated' | string
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginForm {
  username: string
  password: string
  role?: 'hr' | 'employee'
}

export interface EmployeeForm {
  name: string
  department: string
  email: string
  phone?: string
  position?: string
  status?: 'active' | 'inactive' | 'terminated'
}

export interface AttendanceForm {
  employeeId?: string
  status: string
  date?: string
  checkInTime?: string
  checkOutTime?: string
  remarks?: string
}

// ============================================
// STORE STATE TYPES
// ============================================

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface EmployeeState {
  employees: Employee[]
  selectedEmployee: Employee | null
  isLoading: boolean
  error: string | null
}

export interface AttendanceState {
  records: Attendance[]
  selectedDate: string
  stats: AttendanceStats | null
  isLoading: boolean
  error: string | null
}

// ============================================
// COMPONENT PROPS TYPES
// ============================================

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface StatusBadge {
  status: 'active' | 'inactive' | 'terminated' | 'present' | 'absent' | 'late' | 'half-day' | 'not-marked'
  label?: string
}

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  HR = 'hr',
  EMPLOYEE = 'employee',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half-day',
  NOT_MARKED = 'not-marked',
}

// ============================================
// HELPER FUNCTIONS TYPES
// ============================================

export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  field: string
  direction: SortDirection
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>